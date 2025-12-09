import { writable, derived } from 'svelte/store';
import type { Card, BuilderFilterFields } from '$lib/card';

export const cards = writable<Card[]>([]);
export const searchBar = writable('');

export const filterOptions = writable<Record<BuilderFilterFields, string[]>>(
    {} as Record<BuilderFilterFields, string[]>
);

export const selectedFilters = writable<Record<BuilderFilterFields, Set<string>>>(
    {} as Record<BuilderFilterFields, Set<string>>
);

export const searchFields = ["Name", "Race", "Effect", "Group", "Clan", "Flavor", "Illustrator"];

// Optimized search with early exit
export const searchBarCards = (cards: Card[], search: string, searchFields: string[]): Card[] => {
    if (!search.trim()) return cards;
    
    const query = search.toLowerCase();
    const results: Card[] = [];
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        for (let j = 0; j < searchFields.length; j++) {
            const value = card[searchFields[j] as keyof Card];
            if (String(value).toLowerCase().includes(query)) {
                results.push(card);
                break;
            }
        }
    }
    
    return results;
}

let searchTimeout: ReturnType<typeof setTimeout> | undefined;
const debouncedSearchBar = writable('');

searchBar.subscribe(value => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        debouncedSearchBar.set(value);
    }, 150); // Reduced debounce for better responsiveness
});

function serializeFilters(filters: Record<BuilderFilterFields, Set<string>>): string {
    const entries = Object.entries(filters)
        .map(([key, set]) => `${key}:${Array.from(set).sort().join(',')}`)
        .sort()
        .join('|');
    return entries;
}

let lastFilterString = '';
let cachedFilteredResult: Card[] = [];

export const filteredCards = derived(
    [cards, debouncedSearchBar, selectedFilters],
    ([$cards, $searchBar, $selectedFilters]) => {
        if ($cards.length === 0) {
            cachedFilteredResult = [];
            return cachedFilteredResult;
        }
        
        const currentFilterString = serializeFilters($selectedFilters);
        const filtersChanged = currentFilterString !== lastFilterString;
        lastFilterString = currentFilterString;
        
        let results = searchBarCards($cards, $searchBar, searchFields);
        
        const activeFilters: Array<[BuilderFilterFields, Set<string>]> = [];
        for (const field of Object.keys($selectedFilters) as BuilderFilterFields[]) {
            const selected = $selectedFilters[field];
            if (selected && selected.size > 0) {
                activeFilters.push([field, selected]);
            }
        }

        if (activeFilters.length === 0) {
            cachedFilteredResult = results;
            return cachedFilteredResult;
        }
        
        const filtered: Card[] = [];
        outer: for (let i = 0; i < results.length; i++) {
            const card = results[i];
            
            for (let j = 0; j < activeFilters.length; j++) {
                const [field, selected] = activeFilters[j];
                let value = String(card[field] ?? "").trim();
                
                if (field === "SetNumber" && value.includes("/")) {
                    value = value.split("/")[0];
                }
                
                if (!selected.has(value)) {
                    continue outer;
                }
            }
            
            filtered.push(card);
        }
        
        cachedFilteredResult = filtered;
        return cachedFilteredResult;
    }
);