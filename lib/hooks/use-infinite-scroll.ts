import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
    /** Whether there are more items to load */
    hasMore: boolean;
    /** Fetch the next page — consumer updates its own state */
    fetchMore: () => Promise<void>;
    /** IntersectionObserver rootMargin (default "0px") */
    rootMargin?: string;
    /** IntersectionObserver threshold (default 0.1) */
    threshold?: number;
    /** Disable the observer, e.g. during search mode (default true) */
    enabled?: boolean;
}

interface UseInfiniteScrollReturn {
    sentinelRef: React.RefObject<HTMLDivElement | null>;
    isFetching: boolean;
}

const useInfiniteScroll = ({
    hasMore,
    fetchMore,
    rootMargin = "0px",
    threshold = 0.1,
    enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
    const sentinelRef = useRef<HTMLDivElement>(null);
    // Ref-based guard prevents duplicate fetches from stale closures
    const isFetchingRef = useRef(false);
    const [isFetching, setIsFetching] = useState(false);

    const stableFetchMore = useCallback(async () => {
        if (isFetchingRef.current || !hasMore) return;
        isFetchingRef.current = true;
        setIsFetching(true);
        try {
            await fetchMore();
        } catch (err) {
            console.error("useInfiniteScroll: fetch failed", err);
        } finally {
            isFetchingRef.current = false;
            setIsFetching(false);
        }
    }, [hasMore, fetchMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !enabled || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) stableFetchMore();
            },
            { rootMargin, threshold },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [stableFetchMore, enabled, hasMore, rootMargin, threshold]);

    return { sentinelRef, isFetching };
};

export { useInfiniteScroll };
