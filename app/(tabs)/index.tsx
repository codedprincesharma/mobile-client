import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput,
  Dimensions,
  StatusBar,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchProducts, fetchCategories } from '../../src/api/services';
import { useCart } from '../../src/context/CartContext';
import { Images, Categories as CategoryImages, Products as ProductImages, Icons } from '../../constants/Assets';
import { Colors, FontFamily } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Blinkit Palette
const BRAND_GREEN = '#34B53A';
const BRAND_LIME = '#A8E340';
const BG_LIME_LIGHT = '#F3F9E1';

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
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

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const renderTopBranding = () => (
    <View style={styles.topBrandSection}>
      <View style={styles.headerLeft}>
        <Text style={styles.brandName}>QuickShop</Text>
        <Text style={styles.deliveryTime}>6 minutes</Text>
        <TouchableOpacity style={styles.locationSelector}>
          <Text style={styles.locationText}>1</Text>
          <Text style={styles.dropdownMini}>▼</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.walletBtn}>
          <Image source={Icons.coupon} style={styles.walletIcon} />
          <Text style={styles.walletBalance}>₹ 0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileIconLabel}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchWrapper}>
      <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput 
          placeholder='Search "Fresh Milk", "Eggs", "Atta"' 
          style={styles.searchInput}
          placeholderTextColor="#888"
          editable={false} // For now, just a visual upgrade
        />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
      <TouchableOpacity 
        onPress={() => setActiveTab('All')}
        style={[styles.tabItem, activeTab === 'All' && styles.tabItemActive]}
      >
        <View style={styles.tabIconContainer}>
          <Image source={Icons.bucket} style={[styles.tabIcon, activeTab === 'All' && styles.tabIconActive]} />
        </View>
        <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>All</Text>
        {activeTab === 'All' && <View style={styles.tabIndicator} />}
      </TouchableOpacity>

      {categories.map((tab: any) => (
        <TouchableOpacity 
          key={tab._id} 
          onPress={() => setActiveTab(tab.name)}
          style={[styles.tabItem, activeTab === tab.name && styles.tabItemActive]}
        >
          <View style={styles.tabIconContainer}>
            <Image 
              source={tab.image ? { uri: tab.image } : Icons.bucket} 
              style={[styles.tabIcon, activeTab === tab.name && styles.tabIconActive]} 
            />
          </View>
          <Text style={[styles.tabText, activeTab === tab.name && styles.tabTextActive]}>{tab.name}</Text>
          {activeTab === tab.name && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter((p: any) => p.category?.name === activeTab);

  const renderHeader = () => (
    <View style={styles.headerStack}>
      {renderTopBranding()}
      {renderSearch()}
      {renderCategoryTabs()}
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroBanner}>
           <View style={styles.heroTextContent}>
              <View style={styles.tagLineRow}>
                <Image source={Icons.delivery} style={styles.flashIcon} />
                <Text style={styles.fastestText}>FLASH DELIVERY</Text>
              </View>
              <Text style={styles.heroMainTitle}>BIG SAVINGS ON DAILY STAPLES!</Text>
              <TouchableOpacity style={styles.heroShopBtn}>
                <Text style={styles.heroShopText}>Shop Now</Text>
              </TouchableOpacity>
           </View>
        </View>
        <Image source={Images.delivery_boy} style={styles.heroGroceryImg} />
      </View>

      {/* Everyday Needs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Everyday Needs</Text>
      </View>
      <View style={styles.categoryGrid}>
        {categories.slice(0, 8).map((cat, index) => (
          <TouchableOpacity key={cat._id} style={styles.gridItem}>
             <View style={styles.gridIconContainer}>
               <Image 
                  source={CategoryImages[`cat${(index % 8) + 1}` as keyof typeof CategoryImages]} 
                  style={styles.gridImage} 
                />
             </View>
             <Text style={styles.gridLabel} numberOfLines={2}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Staples</Text>
      </View>
    </View>
  );

  const renderProduct = ({ item, index }: any) => {
    const productImage = item.images?.[0] 
      ? { uri: item.images[0] } 
      : ProductImages[`p${(index % 16) + 1}` as keyof typeof ProductImages];

    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <View style={styles.productImageWrapper}>
          <Image source={productImage} style={styles.prodImg} />
          {item.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of stock</Text>
            </View>
          )}
          <TouchableOpacity style={styles.wishlistIcon}>
            <Text style={styles.heartText}>♡</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.prodDetails}>
          <Text style={styles.prodWeight}>1 Unit</Text>
          <Text style={styles.prodName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.deliveryBadge}>
              <Image source={Icons.clock} style={styles.clockIcon} />
              <Text style={styles.deliveryBadgeText}>6 minutes</Text>
          </View>

          <View style={styles.priceAddRow}>
            <View>
              <Text style={styles.currentPrice}>₹{item.price}</Text>
              <Text style={styles.mrpPrice}>₹{item.price + 20}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND_GREEN} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found in this category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  listContainer: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header Stack
  headerStack: { backgroundColor: '#fff' },
  topBrandSection: { 
    backgroundColor: BRAND_LIME, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingTop: 10,
    paddingBottom: 20
  },
  headerLeft: { flex: 1 },
  brandName: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  deliveryTime: { fontSize: 32, fontFamily: FontFamily.extraBold, color: '#000', marginTop: -5 },
  locationSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { fontSize: 16, fontFamily: FontFamily.extraBold, color: '#1c1c1c', marginRight: 5 },
  dropdownMini: { fontSize: 10, color: '#000' },

  headerRight: { flexDirection: 'row', alignItems: 'center' },
  walletBtn: { 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  walletIcon: { width: 18, height: 18, marginRight: 5 },
  walletBalance: { fontSize: 14, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  profileBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  profilePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  profileIconLabel: { fontSize: 20 },

  // Search
  searchWrapper: { 
    paddingHorizontal: 15, 
    marginTop: -15, 
    zIndex: 10 
  },
  searchContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    height: 56, 
    flexDirection: 'row',
    alignItems: 'center', 
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: FontFamily.medium, color: '#1c1c1c' },

  // Tabs
  tabsScroll: { 
    marginTop: 15, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  tabItem: { alignItems: 'center', marginRight: 25, paddingBottom: 10, minWidth: 60 },
  tabItemActive: { },
  tabIconContainer: { marginBottom: 4 },
  tabIcon: { width: 24, height: 24, resizeMode: 'contain' },
  tabIconActive: { tintColor: BRAND_GREEN },
  tabText: { fontSize: 12, fontFamily: FontFamily.bold, color: '#555' },
  tabTextActive: { color: BRAND_GREEN, fontFamily: FontFamily.bold },
  tabIndicator: { position: 'absolute', bottom: 0, height: 3, width: '100%', backgroundColor: '#000', borderRadius: 2 },

  // Hero Section
  heroSection: { 
    margin: 15, 
    backgroundColor: '#E8F5E9', 
    borderRadius: 20, 
    height: 200, 
    overflow: 'hidden',
    position: 'relative',
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  heroBanner: { padding: 25, flex: 1 },
  heroTextContent: { flex: 1, maxWidth: '65%' },
  tagLineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  flashIcon: { width: 22, height: 22, marginRight: 8, tintColor: BRAND_GREEN },
  fastestText: { fontSize: 14, fontFamily: FontFamily.extraBold, color: BRAND_GREEN, letterSpacing: 1 },
  heroMainTitle: { fontSize: 26, fontFamily: FontFamily.extraBold, color: '#1c1c1c', lineHeight: 32, marginBottom: 15 },
  heroShopBtn: { backgroundColor: BRAND_GREEN, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignSelf: 'flex-start' },
  heroShopText: { color: '#fff', fontSize: 14, fontFamily: FontFamily.bold },
  heroGroceryImg: { width: 140, height: 140, position: 'absolute', right: -10, bottom: -10, resizeMode: 'contain' },

  // Category Grid
  sectionHeader: { paddingHorizontal: 15, marginTop: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 10 
  },
  gridItem: { 
    width: (width - 20) / 4, 
    alignItems: 'center', 
    marginBottom: 20,
    paddingHorizontal: 5
  },
  gridIconContainer: { 
    width: 75, 
    height: 75, 
    borderRadius: 15, 
    backgroundColor: BG_LIME_LIGHT, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 8
  },
  gridImage: { width: '70%', height: '70%', resizeMode: 'contain' },
  gridLabel: { fontSize: 11, fontFamily: FontFamily.bold, color: '#1c1c1c', textAlign: 'center' },

  // Product Cards
  productCard: { 
    width: (width) / 3, 
    padding: 10,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#f0f0f0'
  },
  productImageWrapper: { 
    width: '100%', 
    height: 100, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  prodImg: { width: '100%', height: '100%', resizeMode: 'contain' },
  outOfStockBadge: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    paddingVertical: 2,
    alignItems: 'center'
  },
  outOfStockText: { fontSize: 10, color: '#888', fontFamily: FontFamily.bold },
  wishlistIcon: { position: 'absolute', top: 5, right: 5 },
  heartText: { fontSize: 18, color: '#bbb' },

  prodDetails: { marginTop: 8 },
  prodWeight: { fontSize: 10, fontFamily: FontFamily.medium, color: '#888' },
  prodName: { fontSize: 12, fontFamily: FontFamily.bold, color: '#1c1c1c', marginTop: 2, height: 34 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888', fontFamily: FontFamily.medium },
  deliveryBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 5
  },
  clockIcon: { width: 10, height: 10, marginRight: 4 },
  deliveryBadgeText: { fontSize: 10, fontFamily: FontFamily.bold, color: '#555' },
  
  priceAddRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  currentPrice: { fontSize: 14, fontFamily: FontFamily.extraBold, color: '#000' },
  mrpPrice: { fontSize: 10, fontFamily: FontFamily.regular, color: '#888', textDecorationLine: 'line-through' },
  addBtn: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: BRAND_GREEN, 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  addBtnText: { color: BRAND_GREEN, fontSize: 12, fontFamily: FontFamily.extraBold }
});
