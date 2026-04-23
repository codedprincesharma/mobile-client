import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  RefreshControl,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchProducts } from '../../src/api/services';
import { useCart } from '../../src/context/CartContext';
import { Images, Categories as CategoryImages, Products as ProductImages } from '../../constants/Assets';
import { FontFamily } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../src/utils/responsive';

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isDesktop, isTablet } = useResponsive();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = {
    primary: '#008e42',
    topBg: '#005b2a',
    surface: '#ffffff',
    surfaceLow: '#f6f6f6',
    surfaceLowest: '#fcfcfc',
    onSurface: '#1a1d1e',
    onSurfaceVariant: '#6e7774',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const prodRes = await fetchProducts();
      setProducts(prodRes.data || []);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderTopBranding = () => (
    <View style={styles.topBrandSection}>
      <View style={styles.locationSelector}>
        <View style={styles.locIconCirc}>
           <Ionicons name="location-sharp" size={16} color={theme.primary} />
        </View>
        <View>
          <Text style={styles.locLabel}>Delivery Location</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.locationText}>Home</Text>
            <Ionicons name="chevron-down" size={16} color="#fff" style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image source={Images.logo} style={styles.headerLogo} tintColor="#ffffff" />
        <TouchableOpacity style={styles.notificationBtn}>
           <Ionicons name="notifications-outline" size={24} color="#fff" />
           <View style={styles.badge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchWrapper}>
      <TouchableOpacity style={styles.searchContainer} activeOpacity={0.9} onPress={() => router.push('/search')}>
        <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search &quot;Organic Apples&quot;</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeroBanner = () => (
    <View style={styles.heroBanner}>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>Welcome to</Text>
        <Text style={styles.heroSub}>Discover our fresh fruits and grocery.</Text>
        <TouchableOpacity style={styles.shopNowBtn}>
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
      <Image source={Images.delivery_boy} style={styles.heroImage} />
    </View>
  );

  const catData = [
    { id: '1', name: 'Fruits', img: CategoryImages.cat4 },
    { id: '2', name: 'Vegetables', img: CategoryImages.cat3 },
    { id: '3', name: 'Dairy', img: CategoryImages.cat1 },
    { id: '4', name: 'Snacks', img: CategoryImages.cat2 },
  ];

  const renderCategories = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoryGrid}>
        {catData.map(cat => (
          <TouchableOpacity key={cat.id} style={styles.catItem}>
             <View style={styles.catImageContainer}>
               <Image source={cat.img} style={styles.catImage} />
             </View>
             <Text style={styles.catText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProduct = ({ item, index }: any) => {
    // Check if we use the old image constant format
    let productImage: any = null;
    if (ProductImages && (ProductImages as any)[`p${(index % 16) + 1}`]) {
      productImage = (ProductImages as any)[`p${(index % 16) + 1}`];
    } else {
      productImage = { uri: item.images?.[0] || 'https://via.placeholder.com/150' };
    }

    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <View style={styles.productImageWrapper}>
          <Image source={productImage} style={styles.prodImg} />
        </View>
        
        <Text style={styles.prodName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.prodPrice}>${item.price}</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => addToCart(item)}
            activeOpacity={0.8}
          >
             <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.greenTopBg}>
        {renderTopBranding()}
      </View>
      
      {/* Overlapping section */}
      <View style={styles.overlapSection}>
        {renderSearch()}
        {renderHeroBanner()}
        {renderCategories()}
        
        <View style={[styles.sectionContainer, { marginTop: 10 }]}>
           <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Featured Items</Text>
              <TouchableOpacity>
                 <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
           </View>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Use 2 columns to match the Product Listing image
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#006c3a" />
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={[theme.primary]} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingBottom: 120 },

  greenTopBg: {
    backgroundColor: '#00a350',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  topBrandSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIconCirc: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
  locLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: FontFamily.medium },
  locationText: { color: '#fff', fontSize: 18, fontFamily: FontFamily.bold },
  
  headerLogo: { width: 30, height: 30, resizeMode: 'contain', marginRight: 15 },
  notificationBtn: { position: 'relative' },
  badge: {
    position: 'absolute', top: 2, right: 3, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#ff4c4c', borderWidth: 1, borderColor: '#00a350'
  },

  overlapSection: {
    marginTop: -30,
    paddingHorizontal: 20,
  },
  
  searchWrapper: { marginBottom: 20 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 25, height: 50, paddingHorizontal: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8
  },
  searchIcon: { marginRight: 10 },
  searchPlaceholder: { fontSize: 15, color: '#aaa', fontFamily: FontFamily.medium },

  heroBanner: {
    backgroundColor: '#008e42',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 25,
  },
  heroContent: { flex: 1, justifyContent: 'center', zIndex: 1 },
  heroTitle: { color: '#fff', fontSize: 24, fontFamily: FontFamily.extraBold, marginBottom: 5 },
  heroSub: { color: '#d1f0df', fontSize: 12, fontFamily: FontFamily.medium, marginBottom: 15, maxWidth: '80%', lineHeight: 18 },
  shopNowBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  shopNowText: { color: '#008e42', fontSize: 13, fontFamily: FontFamily.bold },
  heroImage: { width: 140, height: 140, position: 'absolute', right: -20, bottom: -20, resizeMode: 'contain', opacity: 0.9 },

  sectionContainer: { marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 15 },
  seeAllText: { fontSize: 14, fontFamily: FontFamily.bold, color: '#008e42', marginBottom: 15 },
  
  categoryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  catItem: { alignItems: 'center', width: '22%' },
  catImageContainer: {
    width: 60, height: 60, borderRadius: 20, backgroundColor: '#f6f6f6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: '#eee'
  },
  catImage: { width: 35, height: 35, resizeMode: 'contain' },
  catText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#333' },

  // Product Grid
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  prodImg: { width: '70%', height: '70%', resizeMode: 'contain' },
  prodName: { fontSize: 14, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 10, height: 40, lineHeight: 18 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodPrice: { fontSize: 15, fontFamily: FontFamily.extraBold, color: '#1a1d1e' },
  
  addBtn: {
    width: 28, height: 28,
    borderRadius: 8,
    backgroundColor: '#008e42',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
