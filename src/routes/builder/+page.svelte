<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { filterFields, type BuilderFilterFields, type Card, getLocalPath, handleImageError} from "$lib/card";
    import { cards, filteredCards, filterOptions, searchBar, selectedFilters } from "./script";
    import MultiSelectDropdown from '$lib/multi_select_dropdown.svelte';
    import DeckBox from "$lib/deck_box.svelte";
    import "./style.css"

    const CARD_HEIGHT = 100; // Height of each card
    const CARDS_PER_ROW = 3;
    const BUFFER_ROWS = 15; // Increased buffer to keep more images loaded
    
    let containerRef: HTMLDivElement;
    let scrollTop = 0;
    let containerHeight = 0;
    let isScrolling = false;
    let scrollRAF: number;
    let lastScrollTop = 0;
    
    // Image cache with eager preloading
    const imageCache = new Map<number, HTMLImageElement>();
    let preloadRAF: number;
    let previousFilterHash = "";
    let previousSearchBar = "";
    
    // Generate a hash of current filters to detect changes
    $: filterHash = JSON.stringify(
        Object.entries($selectedFilters)
            .map(([k, v]) => [k, Array.from(v)])
            .sort()
    );
    
    // Clear everything when filters OR search changes
    $: {
        const searchChanged = $searchBar !== previousSearchBar && previousSearchBar !== "";
        const filterChanged = filterHash !== previousFilterHash && previousFilterHash !== "";
        
        if (searchChanged || filterChanged) {
            // Reset scroll position
            if (containerRef) {
                containerRef.scrollTop = 0;
            }
            scrollTop = 0;
            lastScrollTop = 0;
            
            imageCache.clear();
            
            if (preloadRAF) {
                cancelAnimationFrame(preloadRAF);
            }
        }
        
        previousFilterHash = filterHash;
        previousSearchBar = $searchBar;
    }
    
    // Aggressive image preloading
    function preloadImages(cardNumbers: number[]) {
        if (preloadRAF) cancelAnimationFrame(preloadRAF);
        
        preloadRAF = requestAnimationFrame(() => {
            cardNumbers.forEach(cardNumber => {
                if (!imageCache.has(cardNumber)) {
                    const img = new Image();
                    img.src = getLocalPath(cardNumber);
                    imageCache.set(cardNumber, img);
                }
            });
        });
    }

    // Note: For integrity sake, making a notice that a lot of the optimisations to the card rendering were widely to thank by the help of AI to optimise the rendering
    $: validCards = $filteredCards.filter(card => card.Race != "-" && card.Race != "");
    $: rows = Math.ceil(validCards.length / CARDS_PER_ROW);
    $: totalHeight = rows * CARD_HEIGHT;
    
    $: startRow = Math.max(0, Math.floor(scrollTop / CARD_HEIGHT) - BUFFER_ROWS);
    $: endRow = Math.min(rows, Math.ceil((scrollTop + containerHeight) / CARD_HEIGHT) + BUFFER_ROWS);
    
    $: startIndex = startRow * CARDS_PER_ROW;
    $: endIndex = Math.min(validCards.length, endRow * CARDS_PER_ROW);
    $: visibleCards = validCards.slice(startIndex, endIndex);
    $: offsetY = startRow * CARD_HEIGHT;
    
    $: {
        if (visibleCards.length > 0 && validCards.length > 0) {
            const scrollDirection = scrollTop > lastScrollTop ? 1 : -1;
            const preloadCount = CARDS_PER_ROW * 10; // Preload 6 rows ahead
            
            const preloadCards: number[] = [];
            
            // Always preload visible cards first
            for (let i = startIndex; i < endIndex; i++) {
                if (validCards[i]) {
                    preloadCards.push(validCards[i].CardNumber);
                }
            }
            
            // Then preload in scroll direction
            if (scrollDirection > 0) {
                const preloadEnd = Math.min(validCards.length, endIndex + preloadCount);
                for (let i = endIndex; i < preloadEnd; i++) {
                    if (validCards[i]) {
                        preloadCards.push(validCards[i].CardNumber);
                    }
                }
            } else {
                const preloadStart = Math.max(0, startIndex - preloadCount);
                for (let i = preloadStart; i < startIndex; i++) {
                    if (validCards[i]) {
                        preloadCards.push(validCards[i].CardNumber);
                    }
                }
            }
            
            preloadImages(preloadCards);
        }
    }

    function handleScroll(e: Event) {
        if (scrollRAF) cancelAnimationFrame(scrollRAF);
        
        scrollRAF = requestAnimationFrame(() => {
            const target = e.target as HTMLDivElement;
            lastScrollTop = scrollTop;
            scrollTop = target.scrollTop;
            isScrolling = true;
            
            setTimeout(() => {
                isScrolling = false;
            }, 100);
        });
    }

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

            if (containerRef) {
                containerHeight = containerRef.clientHeight;
            }
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

    <div class="card-container" bind:this={containerRef} on:scroll={handleScroll}>
        {#if $cards.length === 0}
            <p class="loading-text">Loading cards...</p>
        {:else}
            <div class="scroll-space" style="height: {totalHeight}px;">
                <div class="card-grid" style="transform: translate3d(0, {offsetY}px, 0);">
                    {#each visibleCards as card (card.CardNumber)}
                        <div class="card">
                            <img 
                                src={getLocalPath(card.CardNumber)}
                                alt={card.Name}
                                draggable="false"
                                loading="eager"
                                on:error={(e) => handleImageError(e, card.ImageURL)}
                                on:contextmenu={(e) => {
                                    e.preventDefault();
                                    onAddCard(card)
                                }}
                            />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>