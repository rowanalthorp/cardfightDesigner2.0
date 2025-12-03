<script lang="ts">
    import { handleImageError, getLocalPath, type Card } from "./card";
    import BaseDeckBox from "./deck-box-components/base_deck_box.svelte";
    import TriggerDeckBox from "./deck-box-components/trigger_deck_box.svelte";
    
    let lo_cards: Card[] = [];
    const max_number_of_cards = 4;
    const deck_limit= 50;
    const max_trigger_number = 16;
    const do_trigger_rules_matter = true;

    function isTriggers(card: Card): boolean {
        if (card.Gift === "-" || card.Gift === "") return false;
        const firstWord = card.Gift.split(" ")[0].toLowerCase();
        const validTriggers = [
            "critical",
            "draw",
            "front",
            "heal",
            "stand",
            "over"
        ];
        return validTriggers.includes(firstWord);
    }

    function getTriggerType(card: Card): string | null {
        if (!isTriggers(card)) return null;
        return card.Gift.split(" ")[0].toLowerCase();
    }

    function getTriggersRules(card: Card): boolean {
        if (!isTriggers(card)) return true;
        const totalTriggers = lo_cards.filter(c => isTriggers(c)).length;
        if (totalTriggers >= max_trigger_number) return false;

        const type = card.Gift.split(" ")[0].toLowerCase();
        if (type === "heal") {
            const max_heal_count = 4;
            const healCount = lo_cards.filter(c => getTriggerType(c) === "heal").length;
            if (healCount >= 4) return false;    
        }
        else if (type == "over") {
            const max_over_count = 1;
            const overCount =lo_cards.filter(c => getTriggerType(c) === "over").length;
            if (overCount >= max_over_count) return false;
        }
        return true;
    }

    export function addCard(card: Card): boolean {
        const count = lo_cards.filter(c => c.Name === card.Name).length;
        if (count >= max_number_of_cards || lo_cards.length >= deck_limit) return false;
        if (!getTriggersRules(card) && do_trigger_rules_matter) return false; // The do_trigger_rules_matter is for later, just in case
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
    <BaseDeckBox {lo_cards} {removeCardByIndex} />
    <TriggerDeckBox {lo_cards} {removeCardByIndex} />
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
    :global(.deck-container) {
        display: grid;
        height: 50vh;
        width: 100vw;
        grid-template-columns: repeat(10, 1fr);
        grid-template-rows: repeat(5, 1fr);
        max-width: 80%;
        max-height: 80%;
        gap: .15rem;
        padding: .5rem;
        box-shadow: -8px 6px 8px rgba(0,0,0,0.4);
    }
    :global(.card) {
        box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
        border-radius: 14px;
        width: auto;
        height: auto;
        object-fit: cover;
    }
    :global(.card img) {
        aspect-ratio: 63 / 88;
        display: block;
        max-width: 100%;
        width: auto;
        max-height: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
        top: .05rem;
        border: 0.0025px solid white;

    }
    :global(.card img:hover) {
        transform: scale(1.05);
        transition: transform 0.1s ease-in;
        box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
    }
</style>