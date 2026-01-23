// Cached Query Hook
// Provides data caching with stale-while-revalidate pattern

import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number; // Time in ms before data is considered stale
  cacheTime: number; // Time in ms before data is evicted from cache
}

interface UseCachedQueryOptions<T> {
  queryFn: () => Promise<T>;
  queryKey: string;
  staleTime?: number; // Default: 30 seconds
  cacheTime?: number; // Default: 5 minutes
  enabled?: boolean; // Default: true
  refetchOnMount?: boolean; // Default: true
  refetchOnWindowFocus?: boolean; // Default: false
}

interface UseCachedQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

// Global cache store
const cache = new Map<string, CacheEntry<any>>();

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.cacheTime) {
      cache.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

export function useCachedQuery<T>({
  queryFn,
  queryKey,
  staleTime = 30000, // 30 seconds
  cacheTime = 300000, // 5 minutes
  enabled = true,
  refetchOnMount = true,
  refetchOnWindowFocus = false,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  const [data, setData] = useState<T | undefined>(() => {
    const cached = cache.get(queryKey);
    return cached?.data;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchRef = useRef<Promise<void> | null>(null);

  const fetchData = async (force = false) => {
    // Check cache first
    const cached = cache.get(queryKey);
    const now = Date.now();

    if (cached && !force) {
      const isStale = now - cached.timestamp > cached.staleTime;
      
      if (!isStale) {
        // Data is fresh, use cache
        setData(cached.data);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        return;
      }
      
      // Data is stale, return cached but fetch in background
      setData(cached.data);
      setIsLoading(true);
    } else {
      setIsLoading(true);
    }

    setIsError(false);
    setError(null);

    try {
      const result = await queryFn();
      
      // Update cache
      cache.set(queryKey, {
        data: result,
        timestamp: now,
        staleTime,
        cacheTime,
      });

      setData(result);
      setIsLoading(false);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsLoading(false);
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const refetch = async () => {
    await fetchData(true);
  };

  const invalidate = () => {
    cache.delete(queryKey);
    setData(undefined);
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    if (refetchOnMount || !cache.has(queryKey)) {
      const promise = fetchData();
      fetchRef.current = promise;
    }

    // Refetch on window focus
    if (refetchOnWindowFocus) {
      const handleFocus = () => {
        fetchData();
      };
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
        if (fetchRef.current) {
          // Cancel pending fetch if component unmounts
          fetchRef.current = null;
        }
      };
    }

    return () => {
      if (fetchRef.current) {
        fetchRef.current = null;
      }
    };
  }, [queryKey, enabled, refetchOnMount, refetchOnWindowFocus]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
  };
}
