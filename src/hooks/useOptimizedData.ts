import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceCache } from '@/lib/performance-cache';

// Optimized data loading hook with caching
export const useOptimizedData = <T>(
  key: string,
  fetchFunction: () => Promise<T> | T,
  dependencies: any[] = [],
  ttl: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchFunctionRef = useRef(fetchFunction);
  
  // Update ref when fetchFunction changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  const loadData = useCallback(async (useCache: boolean = true) => {
    const cacheKey = `${key}_${JSON.stringify(dependencies)}`;
    
    // Try cache first if enabled
    if (useCache && performanceCache.has(cacheKey)) {
      const cachedData = performanceCache.get(cacheKey);
      setData(cachedData);
      return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunctionRef.current();
      setData(result);
      
      // Cache the result
      performanceCache.set(cacheKey, result, ttl);
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error(`Error loading ${key}:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, ttl, ...dependencies]); // Removed fetchFunction from dependencies

  // Load data on mount and dependency changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Force refresh without cache
  const refresh = useCallback(() => {
    return loadData(false);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    loadData
  };
};