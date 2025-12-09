<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { filterFields, type BuilderFilterFields, type Card, getLocalPath, handleImageError} from "$lib/card";
    import { cards, filteredCards, filterOptions, searchBar, selectedFilters } from "./script";
    import MultiSelectDropdown from '$lib/multi_select_dropdown.svelte';
    import DeckBox from "$lib/deck_box.svelte";
    import "./style.css"

    const CARD_HEIGHT = 100;
    const CARDS_PER_ROW = 3;
    const BUFFER_ROWS = 5;
    
    let containerRef: HTMLDivElement;
    let scrollTop = 0;
    let containerHeight = 0;
    let resizeObserver: ResizeObserver;
    
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastKnownScrollTop = 0;
    
    function handleScroll(e: Event) {
        const target = e.target as HTMLDivElement;
        const newScrollTop = target.scrollTop;

        scrollTop = newScrollTop;
        lastKnownScrollTop = newScrollTop;
        isScrolling = true;
        
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            scrollTop = containerRef ? containerRef.scrollTop : lastKnownScrollTop;
        }, 100);
    }

    // Single source of truth for valid cards
    $: validCards = $filteredCards.filter(card => card.Race != "-" && card.Race != "");
    $: rows = Math.ceil(validCards.length / CARDS_PER_ROW);
    $: totalHeight = rows * CARD_HEIGHT;
    
    // Calculate visible range - always based on current scrollTop
    $: startRow = Math.max(0, Math.floor(scrollTop / CARD_HEIGHT) - BUFFER_ROWS);
    $: endRow = Math.min(rows, Math.ceil((scrollTop + containerHeight) / CARD_HEIGHT) + BUFFER_ROWS);
    
    $: startIndex = startRow * CARDS_PER_ROW;
    $: endIndex = Math.min(validCards.length, endRow * CARDS_PER_ROW);
    
    // Always render based on current scroll position
    $: visibleCards = validCards.slice(startIndex, endIndex);
    $: offsetY = startRow * CARD_HEIGHT;

    // Safety check: if visibleCards is empty but we should have cards, force recalculation NOTE: The signature '(fn: () => void): void' of 'afterUpdate' is deprecated
    afterUpdate(() => {
        if (!isScrolling && visibleCards.length === 0 && validCards.length > 0 && containerRef) {
            const currentScroll = containerRef.scrollTop;
            if (currentScroll !== scrollTop) {
                scrollTop = currentScroll;
            }
        }
    });

    let previousCardCount = 0;
    $: {
        const currentCount = validCards.length;
        if (previousCardCount > 0 && currentCount !== previousCardCount && containerRef) {
            containerRef.scrollTop = 0;
            scrollTop = 0;
            lastKnownScrollTop = 0;
        }
        previousCardCount = currentCount;
    }

    onMount(async () => {
        try {
            const resCards = await fetch('/data/cards.json');
            if (!resCards.ok) throw new Error("Error could not retrieve the cards info");
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

            if (containerRef) {
                containerHeight = containerRef.clientHeight;
                
                resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        containerHeight = entry.contentRect.height;
                    }
                });
                resizeObserver.observe(containerRef);
                
                scrollTop = containerRef.scrollTop;
            }
        } catch (error) {
            console.error("Cards are not loading:", error);
        }
    });

    onDestroy(() => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
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

    <div class="card-container" bind:this={containerRef} on:scroll={handleScroll}>
        {#if $cards.length === 0}
            <p class="loading-text">Loading cards...</p>
        {:else if validCards.length === 0}
            <p class="loading-text">No cards match your filters</p>
        {:else}
            <div class="scroll-space" style="height: {totalHeight}px;">
                <div class="card-grid" style="transform: translateY({offsetY}px);">
                    {#each visibleCards as card (card.CardNumber)}
                        <div class="card">
                            <img 
                                src={getLocalPath(card.CardNumber)}
                                alt={card.Name}
                                draggable="false"
                                loading="lazy"
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
            </div>
        {/if}
    </div>
</div>