<script lang="ts">
    import { onMount } from 'svelte';
    import { filterFields, type BuilderFilterFields, type Card, getLocalPath, handleImageError} from "$lib/card";
    import { cards, filteredCards, filterOptions, searchBar, selectedFilters } from "./script";
    import MultiSelectDropdown from '$lib/multi_select_dropdown.svelte';
    import DeckBox from "$lib/deck_box.svelte";
    import Pagination from '$lib/page-bar-component/pagination.svelte';
    import "./style.css"

    let cardsPerPage = 27;
    let currentPage = 1;

    $: validCards = $filteredCards.filter(card => card.Race != "-" && card.Race != "");
    $: totalPages = Math.max(1, Math.ceil(validCards.length / cardsPerPage));
    $: if (currentPage > totalPages) currentPage = totalPages;
    
    $: paginatedCards = validCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

    let previousCardCount = 0;
    $: {
        const currentCount = validCards.length;
        if (currentCount !== previousCardCount) {
            currentPage = 1;
            previousCardCount = currentCount;
        }
    }

    onMount(async () => {
        try {
            const resCards = await fetch('/data/cards.json');
            if (!resCards.ok) throw new Error("Error could not retrieve the cards info, Sadge");
            const allCards: Card[] = await resCards.json();
            cards.set(allCards);
            
            const resFilter = await fetch('/data/unique_card_values.json');
            if (!resFilter.ok) throw new Error("Error failed to load the filter dropdown");
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
            console.error("Cards are not loading:", error);
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
    <button class="filterExpandBtn" on:click={clickExpandFilters}>
        {expandFilters ? 'Collapse' : 'Expand'} Filters
    </button>
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

    <Pagination bind:currentPage {totalPages} />

    <div class="card-container">
        {#if $cards.length === 0}
            <p class="loading-text">Loading cards...</p>
        {:else if validCards.length === 0}
            <p class="loading-text">No cards match your filters</p>
        {:else}
            <div class="card-grid">
                {#each paginatedCards as card (card.CardNumber)}
                    <div class="card">
                        <img 
                            src={getLocalPath(card.CardNumber)}
                            alt={card.Name}
                            draggable="false"
                            loading="eager"
                            decoding="async"
                            on:error={(e) => handleImageError(e, card.ImageURL)}
                            on:contextmenu={(e) => {
                                e.preventDefault();
                                onAddCard(card);
                            }}
                        />
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>