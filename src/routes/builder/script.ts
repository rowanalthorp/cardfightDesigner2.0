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

export const filteredCards = derived(
    [cards, searchBar, selectedFilters],
    ([$cards, $searchBar, $selectedFilters]) => {
        let results = searchBarCards($cards, $searchBar, searchFields);
        for (const field of Object.keys($selectedFilters) as BuilderFilterFields[]) {
            const selected = $selectedFilters[field];
            if (selected && selected.size > 0) {
                results = results.filter(card => {
                    let value = String(card[field] ?? "").trim();
                    if (field == "SetNumber" && value.includes("/")) {
                        value = value.split("/")[0];
                    }
                    return selected.has(value);
                });
            }
        }
        return results;
    }
);