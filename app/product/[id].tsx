import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchProductById } from '../../src/api/services';
import { useCart } from '../../src/context/CartContext';
import { Products as ProductImages, Icons } from '../../constants/Assets';
import { FontFamily } from '../../constants/theme';

const { width } = Dimensions.get('window');
const BRAND_GREEN = '#34B53A';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct(id as string);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await fetchProductById(productId);
      setProduct(data.data);
    } catch (error) {
      console.error('Failed to load product', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND_GREEN} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const productImage = product.images?.[0] 
    ? { uri: product.images[0] } 
    : ProductImages[`p${(parseInt(id as string, 16) % 16) + 1}` as keyof typeof ProductImages];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={productImage} style={styles.productImage} />
          <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category?.name || 'FEATURED'}</Text>
            </View>
            <View style={styles.deliveryBadge}>
                <Image source={Icons.clock} style={styles.clockIcon} />
                <Text style={styles.deliveryBadgeText}>6 minutes</Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description || 'Premium quality product, delivered fresh to your doorstep in minutes.'}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Image source={Icons.clock} style={styles.infoIcon} />
              <Text style={styles.infoValue}>6 mins</Text>
              <Text style={styles.infoLabel}>Delivery</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.infoItem}>
              <Image source={Icons.delivery} style={styles.infoIcon} />
              <Text style={styles.infoValue}>FREE</Text>
              <Text style={styles.infoLabel}>Shipping</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.infoItem}>
              <Image source={Icons.store} style={styles.infoIcon} />
              <Text style={styles.infoValue}>{product.stock > 0 ? 'In Stock' : 'Out'}</Text>
              <Text style={styles.infoLabel}>Status</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>Freshly prepared on order for maximum quality</Text>
          </View>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>Sourced directly from certified suppliers</Text>
          </View>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>Safe and hygienic contactless delivery</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{product.price}</Text>
            <Text style={styles.mrpText}>MRP ₹{product.price + 20}</Text>
          </View>
          <Text style={styles.unitText}>Inclusive of all taxes</Text>
        </View>
        <TouchableOpacity 
          style={[styles.buyButton, product.stock === 0 && styles.disabledButton]} 
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.buyButtonText}>
            {product.stock === 0 ? 'Out of Stock' : 'ADD TO CART'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: width, height: width * 1.1, position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: '#f9f9f9' },
  backCircle: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(0,0,0,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backIcon: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  
  detailsContainer: { 
    padding: 20, 
    backgroundColor: '#fff', 
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: 500
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  categoryBadge: { backgroundColor: '#F3F9E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryText: { color: '#444', fontSize: 11, fontFamily: FontFamily.bold, textTransform: 'uppercase' },
  deliveryBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  clockIcon: { width: 12, height: 12, marginRight: 6 },
  deliveryBadgeText: { fontSize: 12, fontFamily: FontFamily.extraBold, color: '#000' },
  
  name: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#1c1c1c', marginBottom: 8 },
  description: { fontSize: 15, fontFamily: FontFamily.medium, color: '#666', lineHeight: 22, marginBottom: 20 },
  
  divider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 20 },
  verticalDivider: { width: 1, height: 30, backgroundColor: '#f0f0f0' },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  infoItem: { alignItems: 'center' },
  infoIcon: { width: 22, height: 22, tintColor: BRAND_GREEN, marginBottom: 8 },
  infoValue: { fontSize: 15, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  infoLabel: { fontSize: 11, fontFamily: FontFamily.medium, color: '#888' },
  
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.extraBold, color: '#1c1c1c', marginBottom: 15 },
  highlightRow: { flexDirection: 'row', marginBottom: 10, paddingRight: 20 },
  highlightBullet: { fontSize: 14, color: BRAND_GREEN, marginRight: 10, fontWeight: 'bold' },
  highlightText: { fontSize: 14, fontFamily: FontFamily.medium, color: '#444', lineHeight: 20 },

  bottomBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 15,
    paddingBottom: 35,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceText: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#1c1c1c', marginRight: 10 },
  mrpText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#999', textDecorationLine: 'line-through' },
  unitText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#999', marginTop: 2 },

  buyButton: { 
    backgroundColor: BRAND_GREEN, 
    paddingVertical: 14, 
    paddingHorizontal: 30, 
    borderRadius: 12,
    shadowColor: BRAND_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buyButtonText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.extraBold },
  disabledButton: { backgroundColor: '#ccc', shadowOpacity: 0 },
  errorText: { fontSize: 18, color: '#666', marginBottom: 20, fontFamily: FontFamily.medium },
  backButtonLarge: { backgroundColor: BRAND_GREEN, padding: 15, borderRadius: 10 },
  backButtonText: { color: '#fff', fontFamily: FontFamily.bold },
});
