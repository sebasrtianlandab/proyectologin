import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para carga async: evita repetir useState + useEffect + setLoading en cada vista.
 * Mantiene el último data en caso de error (no lo borra).
 */
export function useAsyncData<T>(
    fetchFn: () => Promise<T>,
    deps: React.DependencyList = []
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const fetchFnRef = useRef(fetchFn);
    fetchFnRef.current = fetchFn;

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFnRef.current();
            setData(result);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, refetch };
}
