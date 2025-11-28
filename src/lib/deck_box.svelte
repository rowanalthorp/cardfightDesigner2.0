<script lang="ts">
    import { handleImageError, getLocalPath, load, type Card } from "./card";
    let lo_cards: Card[] = [];
    const max_number_of_cards = 4;
    const deck_limit= 50;
    
    export function addCard(card: Card): boolean {
        const count = lo_cards.filter(c => c.Name === card.Name).length;
        if (count >= max_number_of_cards || lo_cards.length >= deck_limit) return false;
        lo_cards = [...lo_cards, card];
        return true;
    }
    function removeCardByIndex(index: number) {
        if (index < 0 || index >= lo_cards.length) return;
        lo_cards.splice(index, 1);
        lo_cards = [...lo_cards];
    }

</script>

<div class="deck-box">
    <h1>Deck Box</h1>
    <div class="deck-container">
        {#each lo_cards ?? [] as card, i (card.CardNumber + '-' + i)}
            <div class="card">
                <img
                    use:load
                    data-src={getLocalPath(card.CardNumber)}
                    src="\assets\placeholder_card.jpg"
                    alt={card.Name}
                    on:error={(e) => handleImageError(e, card.ImageURL)}
                    on:contextmenu={(e) => {
                        e.preventDefault();
                        removeCardByIndex(i);
                    }}
                />
            </div>
        {/each}
    </div>
</div>


<style>
    .deck-box {
        background: black;
        display: flex;
        flex-direction: column;
        position: fixed;
        width: min(50vw, 90vh * 1.07);
        height: min(90vh, 50vw / 1.07);
        left: 22vw;
        top: 15vh;
        justify-content: center;
    }
    .deck-container {
        display: grid;
        aspect-ratio: 9 / 8.5;
        height: auto;
        width: auto;
        max-width: 150%;
        max-height: 150%;
        grid-template-columns: repeat(10, 1fr);
        grid-auto-rows: min-content;
        gap: .25rem;
    }
    .card {
        box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
        border-radius: 14px;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .card img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
        top: .25rem;

    }
    .card img:hover {
        transform: scale(1.05);
        transition: transform 0.1s ease-in;
        box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
    }
</style>