/**
 * Best Sellers Analysis Utility
 * Analyzes order data to identify and rank best-selling products
 */

export interface BestSellerProduct {
  id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averagePrice: number;
  trend: 'up' | 'down' | 'stable';
  badge?: string;
  image?: string;
}

export interface BestSellerStats {
  products: BestSellerProduct[];
  totalOrders: number;
  totalRevenue: number;
  timeRange: 'week' | 'month' | 'all';
  lastUpdated: number;
}

/**
 * Analyzes orders and aggregates product sales data
 */
export const analyzeBestSellers = (
  orders: any[],
  limit: number = 10,
  timeRange: 'week' | 'month' | 'all' = 'month'
): BestSellerProduct[] => {
  if (!orders || orders.length === 0) {
    return [];
  }

  const now = Date.now();
  const timeRangeMs = {
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    all: Infinity,
  };

  // Filter orders by time range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt).getTime();
    return now - orderDate < timeRangeMs[timeRange];
  });

  // Aggregate product data
  const productMap = new Map<
    string,
    {
      name: string;
      totalQuantity: number;
      totalRevenue: number;
      orderCount: number;
      prices: number[];
      image?: string;
    }
  >();

  filteredOrders.forEach((order) => {
    if (!order.items || !Array.isArray(order.items)) return;

    order.items.forEach((item: any) => {
      const productId = item.productId?._id || item.productId || item.id;
      const productName = item.productId?.name || item.name || 'Unknown';
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const revenue = quantity * price;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          name: productName,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
          prices: [],
          image: item.productId?.image || item.image,
        });
      }

      const product = productMap.get(productId)!;
      product.totalQuantity += quantity;
      product.totalRevenue += revenue;
      product.orderCount += 1;
      product.prices.push(price);
    });
  });

  // Convert to array and sort by revenue
  const bestSellers: BestSellerProduct[] = Array.from(productMap.entries()).map(
    ([id, data]) => ({
      id,
      name: data.name,
      totalQuantity: data.totalQuantity,
      totalRevenue: data.totalRevenue,
      orderCount: data.orderCount,
      averagePrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : 0,
      trend: determineTrend(data.prices),
      image: data.image,
      badge: getBadge(data.totalQuantity, data.orderCount),
    })
  );

  // Sort by revenue (descending)
  bestSellers.sort((a, b) => b.totalRevenue - a.totalRevenue);

  return bestSellers.slice(0, limit);
};

/**
 * Determines trend based on price history
 */
const determineTrend = (prices: number[]): 'up' | 'down' | 'stable' => {
  if (prices.length < 2) return 'stable';

  const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
  const secondHalf = prices.slice(Math.floor(prices.length / 2));

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100;

  if (percentChange > 5) return 'up';
  if (percentChange < -5) return 'down';
  return 'stable';
};

/**
 * Assigns badge based on performance metrics
 */
const getBadge = (totalQuantity: number, orderCount: number): string | undefined => {
  if (totalQuantity > 1000) return '🔥 Hot';
  if (orderCount > 50) return '⭐ Popular';
  if (totalQuantity > 500) return '✨ Trending';
  return undefined;
};

/**
 * Gets products that are frequently ordered together
 */
export const getFrequentlyOrderedTogether = (
  orders: any[],
  productId: string,
  limit: number = 5
): BestSellerProduct[] => {
  if (!orders || orders.length === 0) {
    return [];
  }

  const productPairs = new Map<string, { count: number; product: any }>();

  orders.forEach((order) => {
    if (!order.items || !Array.isArray(order.items)) return;

    const hasTargetProduct = order.items.some(
      (item: any) => (item.productId?._id || item.productId || item.id) === productId
    );

    if (hasTargetProduct) {
      order.items.forEach((item: any) => {
        const itemId = item.productId?._id || item.productId || item.id;
        if (itemId !== productId) {
          if (!productPairs.has(itemId)) {
            productPairs.set(itemId, {
              count: 0,
              product: item,
            });
          }
          productPairs.get(itemId)!.count += 1;
        }
      });
    }
  });

  return Array.from(productPairs.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([id, data]) => ({
      id,
      name: data.product.name || 'Unknown',
      totalQuantity: data.count,
      totalRevenue: data.count * (data.product.price || 0),
      orderCount: data.count,
      averagePrice: data.product.price || 0,
      trend: 'stable',
      image: data.product.image,
    }));
};
