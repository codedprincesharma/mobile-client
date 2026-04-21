/**
 * Custom Hook: useBestSellers
 * Manages best seller data with caching and analytics
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BestSellerProduct, analyzeBestSellers, BestSellerStats } from '../utils/bestSellersAnalyzer';

interface UseBestSellersOptions {
  limit?: number;
  timeRange?: 'week' | 'month' | 'all';
  cacheTimeMs?: number;
  orders?: any[];
  enabled?: boolean;
}

const CACHE_KEY = '@goghar_best_sellers_cache';
const DEFAULT_CACHE_TIME = 60 * 60 * 1000; // 1 hour

interface CachedData {
  data: BestSellerProduct[];
  timestamp: number;
}

export const useBestSellers = ({
  limit = 10,
  timeRange = 'month',
  cacheTimeMs = DEFAULT_CACHE_TIME,
  orders = [],
  enabled = true,
}: UseBestSellersOptions = {}) => {
  const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<BestSellerStats | null>(null);
  const isMountedRef = useRef(true);
  const cacheRef = useRef<CachedData | null>(null);

  const computeBestSellers = useCallback(async () => {
    if (!enabled || orders.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      try {
        const cachedJson = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedJson) {
          const cached: CachedData = JSON.parse(cachedJson);
          const now = Date.now();

          // If cache is still valid, use it
          if (now - cached.timestamp < cacheTimeMs) {
            if (isMountedRef.current) {
              setBestSellers(cached.data);
              cacheRef.current = cached;
              setLoading(false);
              return;
            }
          }
        }
      } catch (cacheError) {
        console.warn('Error reading cache:', cacheError);
      }

      // Compute best sellers from orders
      const computed = analyzeBestSellers(orders, limit, timeRange);

      if (isMountedRef.current) {
        setBestSellers(computed);

        // Calculate stats
        const totalRevenue = computed.reduce((sum, p) => sum + p.totalRevenue, 0);
        const totalOrders = new Set(
          orders.map((o) => o._id)
        ).size;

        setStats({
          products: computed,
          totalOrders,
          totalRevenue,
          timeRange,
          lastUpdated: Date.now(),
        });

        // Cache the result
        try {
          const cacheData: CachedData = {
            data: computed,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          cacheRef.current = cacheData;
        } catch (cacheWriteError) {
          console.warn('Error writing cache:', cacheWriteError);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [orders, limit, timeRange, cacheTimeMs, enabled]);

  useEffect(() => {
    isMountedRef.current = true;
    computeBestSellers();

    return () => {
      isMountedRef.current = false;
    };
  }, [computeBestSellers]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    // Clear cache before recomputing
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      cacheRef.current = null;
    } catch (err) {
      console.warn('Error clearing cache:', err);
    }
    await computeBestSellers();
  }, [computeBestSellers]);

  /**
   * Clear cache utility
   */
  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      cacheRef.current = null;
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, []);

  return {
    bestSellers,
    loading,
    error,
    stats,
    refresh,
    clearCache,
    isCached: cacheRef.current !== null,
  };
};

/**
 * Hook for tracking best seller analytics
 */
export const useBestSellerAnalytics = () => {
  const trackProductView = useCallback((productId: string, productName: string) => {
    // In a real app, send to analytics service
    console.log(`[Analytics] Viewed best seller: ${productName} (${productId})`);
  }, []);

  const trackProductClick = useCallback((productId: string, position: number) => {
    console.log(`[Analytics] Clicked best seller at position ${position}: ${productId}`);
  }, []);

  const trackAddToCart = useCallback((productId: string, productName: string, fromBestSellers: boolean) => {
    if (fromBestSellers) {
      console.log(`[Analytics] Added to cart from best sellers: ${productName} (${productId})`);
    }
  }, []);

  return {
    trackProductView,
    trackProductClick,
    trackAddToCart,
  };
};
