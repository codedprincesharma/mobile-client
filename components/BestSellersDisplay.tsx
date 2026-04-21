/**
 * Best Sellers Display Component
 * Beautiful, performant component for displaying best-selling products
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BestSellerProduct } from '../utils/bestSellersAnalyzer';

interface BestSellersDisplayProps {
  products: BestSellerProduct[];
  loading?: boolean;
  error?: Error | null;
  onProductPress: (product: BestSellerProduct, index: number) => void;
  horizontal?: boolean;
  maxItems?: number;
  showStats?: boolean;
  onRefresh?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 16;
const CARD_HEIGHT = 280;

const BestSellersDisplay: React.FC<BestSellersDisplayProps> = ({
  products,
  loading = false,
  error = null,
  onProductPress,
  horizontal = false,
  maxItems = 10,
  showStats = true,
  onRefresh,
}) => {
  const displayProducts = useMemo(() => products.slice(0, maxItems), [products, maxItems]);

  const renderBadge = (product: BestSellerProduct) => {
    if (!product.badge) return null;

    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              product.badge.includes('Hot') ? '#ff6b6b' : product.badge.includes('Popular') ? '#ffd43b' : '#4ecdc4',
          },
        ]}
      >
        <Text style={styles.badgeText}>{product.badge}</Text>
      </View>
    );
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const iconMap = {
      up: { name: 'trending-up', color: '#2ecc71' },
      down: { name: 'trending-down', color: '#e74c3c' },
      stable: { name: 'remove', color: '#95a5a6' },
    };

    return (
      <View style={styles.trendContainer}>
        <Ionicons name={iconMap[trend].name as any} size={14} color={iconMap[trend].color} />
        <Text style={[styles.trendText, { color: iconMap[trend].color }]}>{trend}</Text>
      </View>
    );
  };

  const renderProduct = ({ item, index }: { item: BestSellerProduct; index: number }) => (
    <TouchableOpacity
      style={[styles.productCard, { width: horizontal ? CARD_WIDTH : '100%' }]}
      onPress={() => onProductPress(item, index)}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image" size={40} color="#ddd" />
          </View>
        )}

        {renderBadge(item)}

        {/* Quick Stats Overlay */}
        <View style={styles.quickStats}>
          <Text style={styles.quantityText}>{item.totalQuantity} sold</Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        {showStats && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statValue}>${item.totalRevenue.toFixed(0)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Orders</Text>
                <Text style={styles.statValue}>{item.orderCount}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.averagePrice}>${item.averagePrice.toFixed(2)}/avg</Text>
              {renderTrendIcon(item.trend)}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>Failed to load best sellers</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (loading && displayProducts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008e42" />
        <Text style={styles.loadingText}>Loading best sellers...</Text>
      </View>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={48} color="#bdc3c7" />
        <Text style={styles.emptyText}>No best sellers yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={horizontal ? 1 : 2}
        scrollEnabled={false}
        columnWrapperStyle={!horizontal ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    marginVertical: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#008e42',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#bdc3c7',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  imageContainer: {
    height: CARD_HEIGHT * 0.6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  quickStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1d1e',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#6e7774',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1d1e',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averagePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#008e42',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default BestSellersDisplay;
