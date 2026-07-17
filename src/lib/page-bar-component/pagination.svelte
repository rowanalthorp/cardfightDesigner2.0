<script lang="ts">
    export let currentPage: number;
    export let totalPages: number;
    export let isNavigating = false;

    let displayPage = currentPage;
    let debounceTimer: ReturnType<typeof setTimeout>;

    $: if (currentPage && !isNavigating) { displayPage = Math.min(currentPage, totalPages); }

    function handlePageChange(delta: number) {
        const newPage = displayPage + delta;
        
        if (newPage >= 1 && newPage <= totalPages) {
            displayPage = newPage;
            isNavigating = true;
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentPage = displayPage;
                isNavigating = false;
            }, 250); 
        }
    }
</script>

<div class="pagination-controls">
    <button on:click={() => handlePageChange(-1)} disabled={displayPage === 1}>Previous</button>
    <span>Page {displayPage} of {totalPages}</span>
    <button on:click={() => handlePageChange(1)} disabled={displayPage === totalPages}>Next</button>
</div>

<style>
    .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin: 10px 0;
        color: white;
    }
    
    .pagination-controls button {
        padding: 5px 15px;
        background: #0502be;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    }

    .pagination-controls button:disabled {
        background: #555;
        cursor: not-allowed;
    }
</style>