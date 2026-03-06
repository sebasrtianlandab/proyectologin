import { useState, useMemo } from 'react';

/**
 * Hook para lista filtrable por búsqueda de texto. Centraliza search + filtered.
 * La vista sigue controlando filtros extra (tipo, estado, etc.) pasándolos en la función.
 */
export function useFilteredList<T>(
    items: T[],
    filterFn: (item: T, search: string) => boolean
): { filtered: T[]; search: string; setSearch: React.Dispatch<React.SetStateAction<string>> } {
    const [search, setSearch] = useState('');
    const filtered = useMemo(
        () => items.filter((item) => filterFn(item, search)),
        [items, search, filterFn]
    );
    return { filtered, search, setSearch };
}
