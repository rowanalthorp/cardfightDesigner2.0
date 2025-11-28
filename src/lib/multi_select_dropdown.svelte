<script lang="ts">
    import type { BuilderFilterFields } from "./card";
    import { filterOptions, selectedFilters } from "../routes/builder/script";
    import { get } from "svelte/store";

    export let field: BuilderFilterFields;
    let search = "";

    function toggleOption(option: string) {
        const selected = { ...get(selectedFilters) };
        const set = new Set(selected[field] ?? []);
        if (set.has(option)) set.delete(option);
        else set.add(option);

        selected[field] = set;
        selectedFilters.set(selected);
    }

    let toggled = false;
    function buttonClicked() {
        toggled = !toggled;
    }
    function clickedOutside(node: Node) {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node)) {
                toggled = false;
            }
        };
        document.addEventListener('click', handleClick, true);
        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        };
    }
</script>

<div class="dropdown">
    <div use:clickedOutside>
    <button class="dropbtn" on:click={buttonClicked}>{field}</button>
    {#if toggled}
    <div class="dropdown-content is-active">
        <input 
            type="text" 
            placeholder="Search..." 
            bind:value={search} 
            class="dropdown-search" 
        />
    <div class="options-list">
        {#each ($filterOptions[field] ?? []).filter(opt => opt.toLowerCase().includes(search.toLowerCase())) as option}
            <label class="option">
                <input
                    type="checkbox"
                    checked={$selectedFilters[field]?.has(option) ?? false}
                    on:change={() => toggleOption(option)}
                />
            {option}
            </label>
        {/each}
    </div>
    </div>
    {/if}
    </div>
</div>

<style>
    .dropdown { 
        flex: 1 1 0; 
        min-width: 0; 
        position: relative;
        display: flex;
        flex-direction: column;
    }
    .dropbtn {
        width: 100%;
        background: #4caf50;
        color: white;
        padding: 6px 2px;
        border: none;
        cursor: pointer;
        z-index: 4;
        white-space: nowrap;
        overflow: hidden;
        font-size: clamp(10px, 1.2vw, 16px);
        border: 1px solid rgb(0, 0, 0);
    }
    .dropdown-content {
        display: flex;
        flex-direction: column;
        background: #222;
        color: white;
        flex-direction: column;
        padding: 0.5rem;
        z-index: 10;
        max-height: 250px;
        width: auto;
        z-index: 5;
    }
    .options-list { overflow-y: auto;}
    .dropbtn:hover {background: rgb(47, 107, 49)}
    .dropdown-search {position: sticky; margin-bottom: 0.5rem; width: 100%; }
    .option { display: flex; align-items: center; margin: 2px 0; overflow-y: auto; }
    .option input { margin-right: 0.5rem; }
</style>