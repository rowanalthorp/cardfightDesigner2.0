<script lang="ts">
    import { onMount } from 'svelte';
    import { filterFields, type BuilderFilterFields, type Card , load, getLocalPath, handleImageError} from "$lib/card";
    import { cards, filteredCards, filterOptions, searchBar, selectedFilters } from "./script";
    import MultiSelectDropdown from '$lib/multi_select_dropdown.svelte';
    import DeckBox from "$lib/deck_box.svelte";
    import "./style.css"

    // const cardLimit = 150; // Number of cards to show
    onMount(async () => {
        try {
            const resCards = await fetch('/data/cards.json');
            if (!resCards.ok) throw new Error("Error could not retreve the cards info Sadge");
            const allCards: Card[] = await resCards.json();
            cards.set(allCards);
            
            const resFilter = await fetch('/data/unique_card_values.json');
            if (!resFilter.ok) throw new Error("Error failed to load the filter dropbox")
            const uniqueValues: Record<BuilderFilterFields, string[]> = await resFilter.json();
            const selected: Record<BuilderFilterFields, Set<string>> = {} as any;
            const options: Record<BuilderFilterFields, string[]> = {} as any;

            for (const field of filterFields) {
                options[field] = (uniqueValues[field] ?? []).filter(v => v && v !== "-" && v !== "").sort();
                selected[field] = new Set();
            }
            filterOptions.set(options);
            selectedFilters.set(selected);
        } catch (error) {
            console.error("Cards are not loading");
        }
    });
    let expandFilters = false;
    function clickExpandFilters() {
        expandFilters = !expandFilters;
    }

    let deckRef: InstanceType<typeof DeckBox>;
    function onAddCard(card: Card) {
        deckRef.addCard(card);
    }
</script>

<DeckBox bind:this={deckRef} />

<div class='card-search'>
    <button class="filterExpandBtn" on:click={clickExpandFilters}>Expand Filters</button>
    {#if expandFilters}
    <div class="expandFilterCol">
        {#each filterFields as field}
            <MultiSelectDropdown {field} />
        {/each}
    </div>
    {/if}
    <input class='search-bar'
        type="text"
        placeholder="Search.........."
        bind:value={$searchBar}
    />

    <div class="card-container">
        {#if $cards.length === 0}
            <p>Loading cards...</p>
        {:else}
        <div class="card-grid">
            {#each $filteredCards as card (card.CardNumber)}
                {#if card.Race != "-" && card.Race != ""}
                    <div class="card">
                        <img 
                        use:load 
                        data-src={getLocalPath(card.CardNumber)} 
                        src="\assets\placeholder_card.jpg"
                        alt={card.Name} 
                        on:error={(e) => handleImageError(e, card.ImageURL)}
                        on:contextmenu={(e) => {
                            e.preventDefault();
                            onAddCard(card)}
                        }
                        />
                    </div>
                {/if}
            {/each}
            </div>
        {/if}
    </div>
</div>