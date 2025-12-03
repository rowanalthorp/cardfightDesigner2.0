<script lang="ts">
    import { handleImageError, getLocalPath, type Card } from "../card";

    export let lo_cards: Card[] = [];
    export let removeCardByIndex: (index: number) => void;
</script>

<div class="deck-container trigger-deck-container">
    {#each lo_cards ?? [] as card, i (card.CardNumber + '-' + i)}
        {#if card.Gift !== '-' && card.Gift !== ""}
        <div class="card">
            <img
                loading="lazy"
                src={getLocalPath(card.CardNumber)}
                alt={card.Name}
                on:error={(e) => handleImageError(e, card.ImageURL)}
                on:contextmenu={(e) => {
                    e.preventDefault();
                    removeCardByIndex(i);
                }}
            />
        </div>
        {/if}
    {/each}
</div>
<style>
    .trigger-deck-container {
        max-height: 20%;
        height: 20vh;
    }
</style>