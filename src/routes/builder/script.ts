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

export const searchBarCards = (cards: Card[], search: string, searchFields: string[]): Card[] => {
    if (!search.trim()) return cards;
        
    const query = search.toLowerCase();

    return cards.filter(card => 
        searchFields.some(field => {
            const value = card[field as keyof Card];
            return String(value).toLowerCase().includes(query);
        })
    );
}

let filterTimeout: ReturnType<typeof setTimeout> | undefined;
const internalFilters = writable<Record<BuilderFilterFields, Set<string>>>(
    {} as Record<BuilderFilterFields, Set<string>>
);

selectedFilters.subscribe(value => {
    if (filterTimeout) clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        internalFilters.set(value);
    }, 100);
});

export const filteredCards = derived(
    [cards, searchBar, internalFilters],
    ([$cards, $searchBar, $selectedFilters]) => {
        if ($cards.length === 0) return [];
        
        let results = searchBarCards($cards, $searchBar, searchFields);
        
        const activeFilters: Array<[BuilderFilterFields, Set<string>]> = [];
        for (const field of Object.keys($selectedFilters) as BuilderFilterFields[]) {
            const selected = $selectedFilters[field];
            if (selected && selected.size > 0) {
                activeFilters.push([field, selected]);
            }
        }
        
        if (activeFilters.length === 0) {
            return results;
        }
        
        return results.filter(card => {
            for (const [field, selected] of activeFilters) {
                let value = String(card[field] ?? "").trim();
                
                if (field === "SetNumber" && value.includes("/")) {
                    value = value.split("/")[0];
                }
                
                if (!selected.has(value)) {
                    return false;
                }
            }
            return true;
        });
    }
);