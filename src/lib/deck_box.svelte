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
        background: none;
        display: flex;
        flex-direction: column;
        position: fixed;
        left: 15vw;
        top: 5vh;
        height: auto;
        justify-content: center;
        width: min(50vw, 90vh);

    }
    .deck-container {
        display: grid;
        height: 50vh;
        width: 100vw;
        grid-template-columns: repeat(10, 1fr);
        grid-template-rows: repeat(5, 1fr);
        max-width: 80%;
        max-height: 80%;
        gap: .15rem;
        padding: .5rem;
        border: 1px solid white;
        box-shadow: -8px 6px 8px rgba(0,0,0,0.4);
    }
    .card {
        box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
        border-radius: 14px;
        width: auto;
        height: auto;
        object-fit: cover;
    }
    .card img {
        aspect-ratio: 63 / 88;
        display: block;
        max-width: 100%;
        width: auto;
        max-height: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
        top: .05rem;

    }
    .card img:hover {
        transform: scale(1.05);
        transition: transform 0.1s ease-in;
        box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
    }
</style>