import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchOrders } from '../../src/api/services';
import { useBestSellers, useBestSellerAnalytics } from '../../src/hooks/useBestSellers';
import BestSellersDisplay from '../../components/BestSellersDisplay';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '../../constants/theme';

// Dummy best sellers products
const DUMMY_BEST_SELLERS = [
  { _id: 'dummy1', name: 'Fresh Organic Apples', price: 4.99, image: 'https://via.placeholder.com/120?text=Apples' },
  { _id: 'dummy2', name: 'Greek Yogurt 500g', price: 3.99, image: 'https://via.placeholder.com/120?text=Yogurt' },
  { _id: 'dummy3', name: 'Whole Wheat Bread', price: 2.49, image: 'https://via.placeholder.com/120?text=Bread' },
  { _id: 'dummy4', name: 'Almond Butter Jar', price: 8.99, image: 'https://via.placeholder.com/120?text=Butter' },
  { _id: 'dummy5', name: 'Mixed Berry Pack', price: 5.99, image: 'https://via.placeholder.com/120?text=Berries' },
  { _id: 'dummy6', name: 'Organic Spinach', price: 1.99, image: 'https://via.placeholder.com/120?text=Spinach' },
];

interface OrderSection {
  title: string;
  data: any[];
  type: 'orders' | 'best-sellers' | 'empty';
}

export default function OrdersListScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBestSellers, setShowBestSellers] = useState(true);
  const router = useRouter();
  const analytics = useBestSellerAnalytics();

  // Best sellers hook with order data
  const {
    bestSellers,
    loading: bestSellersLoading,
    error: bestSellersError,
    stats: bestSellersStats,
    refresh: refreshBestSellers,
  } = useBestSellers({
    limit: 6,
    timeRange: 'month',
    orders,
    enabled: showBestSellers && orders.length > 0,
  });

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      const ordersData = data.data || [];
      setOrders(ordersData);
      
      // Log analytics
      if (ordersData.length > 0) {
        console.log(`[Analytics] Loaded ${ordersData.length} orders`);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
      Alert.alert('Error', 'Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadOrders();
      await refreshBestSellers();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle best seller product click
  const handleBestSellerPress = useCallback((product: any, index: number) => {
    analytics.trackProductClick(product.id, index);
    // Navigate to product detail
    router.push(`/product/${product.id}`);
  }, [router, analytics]);

  // Memoized sections for better performance
  const sections: OrderSection[] = useMemo(() => {
    const result: OrderSection[] = [];

    // Always add best sellers section at the top
    if (showBestSellers) {
      const displayBestSellers = bestSellers && bestSellers.length > 0 ? bestSellers : DUMMY_BEST_SELLERS;
      result.push({
        title: 'Suggestions for You',
        data: [{ type: 'best-sellers', products: displayBestSellers }],
        type: 'best-sellers',
      });
    }

    // Add orders section
    if (orders.length > 0) {
      result.push({
        title: 'My Orders',
        data: orders,
        type: 'orders',
      });
    } else if (!showBestSellers) {
      result.push({
        title: 'No Orders',
        data: [{ empty: true }],
        type: 'empty',
      });
    }

    return result;
  }, [orders, showBestSellers, bestSellers]);

  const renderSectionHeader = ({ section }: { section: OrderSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.type === 'best-sellers' && bestSellersStats && (
        <Text style={styles.sectionSubtitle}>
          {bestSellersStats.products.length} products • ${bestSellersStats.totalRevenue.toFixed(0)} revenue
        </Text>
      )}
    </View>
  );

  const renderItem = ({ item, section }: { item: any; section: OrderSection }) => {
    // Render best sellers section
    if (section.type === 'best-sellers') {
      const productsToDisplay = item.products || (bestSellers && bestSellers.length > 0 ? bestSellers : DUMMY_BEST_SELLERS);
      return (
        <View style={styles.bestSellersContainer}>
          <View style={styles.suggestionGrid}>
            {productsToDisplay.slice(0, 6).map((product: any, idx: number) => (
              <TouchableOpacity
                key={product._id}
                style={styles.suggestionCard}
                onPress={() => {
                  analytics.trackProductClick(product._id, idx);
                  router.push(`/product/${product._id}`);
                }}
              >
                <View style={styles.suggestionImageWrapper}>
                  <Image 
                    source={{ uri: product.image }}
                    style={styles.suggestionImage}
                  />
                </View>
                <Text style={styles.suggestionName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.suggestionPrice}>${product.price?.toFixed(2) || '0.00'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Render empty state
    if (section.type === 'empty') {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="bag-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          <TouchableOpacity 
            style={styles.browseButton} 
            onPress={() => router.replace('/(tabs)')}
          >
            <Ionicons name="shopping" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.browseText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render order card
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => router.push(`/orders/${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.orderCardContent}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Order #{item._id.substring(0, 8)}</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
              <Text style={styles.statusBadgeText}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            <Text style={styles.itemCount}>
              {item.items?.length || 0} {(item.items?.length || 0) === 1 ? 'item' : 'items'}
            </Text>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.orderTotal}>${item.totalAmount?.toFixed(2) || '0.00'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#6e7774" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008e42" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#008e42" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowBestSellers(!showBestSellers)}
          >
            <Ionicons 
              name={showBestSellers ? "star" : "star-outline"} 
              size={20} 
              color={showBestSellers ? "#ffd43b" : "#6e7774"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#008e42']}
            tintColor="#008e42"
          />
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    marginTop: 16,
  },
  browseButton: {
    backgroundColor: '#008e42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  browseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonContainer: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1d1e',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    padding: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1d1e',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6e7774',
    marginTop: 4,
  },
  bestSellersContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#eee',
    borderBottomColor: '#eee',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderCardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1d1e',
  },
  orderDate: {
    fontSize: 12,
    color: '#6e7774',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  orderItems: {
    paddingVertical: 8,
  },
  itemCount: {
    fontSize: 13,
    color: '#6e7774',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#008e42',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  suggestionCard: {
    width: '30%',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  suggestionImageWrapper: {
    width: '100%',
    height: 80,
    backgroundColor: '#e8f5ce',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  suggestionImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  suggestionName: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: '#1a1d1e',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 16,
  },
  suggestionPrice: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: '#008e42',
  },
});

const getStatusBadgeStyle = (status: string) => {
  const styles: { [key: string]: any } = {
    Delivered: { backgroundColor: '#2ecc71' },
    Pending: { backgroundColor: '#f39c12' },
    Processing: { backgroundColor: '#3498db' },
    Shipped: { backgroundColor: '#9b59b6' },
    Cancelled: { backgroundColor: '#e74c3c' },
  };

  return styles[status] || { backgroundColor: '#95a5a6' };
};

const getStatusStyle = (status: string) => ({
  fontWeight: 'bold' as const,
  color:
    status === 'Delivered'
      ? '#2ecc71'
      : status === 'Pending'
        ? '#f39c12'
        : status === 'Processing'
          ? '#3498db'
          : status === 'Shipped'
            ? '#9b59b6'
            : '#e74c3c',
});
