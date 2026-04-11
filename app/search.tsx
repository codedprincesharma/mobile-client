import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchProducts } from '../src/api/services';
import { useCart } from '../src/context/CartContext';
import { FontFamily } from '../constants/theme';
import { Products as ProductImages } from '../constants/Assets';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#008e42', 
  topBg: '#00a350', // Same as Home Header
  surface: '#ffffff',
  surfaceLow: '#f9f9f9', 
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

const TRENDING_SEARCHES = ['Milk', 'Bread', 'Eggs', 'Amul Butter', 'Chips', 'Cold Drink'];

let searchTimeout: ReturnType<typeof setTimeout>;

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    // Debounce the API call
    setIsSearching(true);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetchProducts(query);
        setResults(res.data || []);
      } catch (error) {
        console.error('Search failed', error);
        setResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const renderProduct = ({ item, index }: any) => {
    // Handling local assets vs remote URIs safely
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
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
             <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.trendingTitle}>Trending Near You</Text>
      <View style={styles.chipsContainer}>
        {TRENDING_SEARCHES.map((term, i) => (
          <TouchableOpacity 
            key={i} 
            style={styles.chip} 
            onPress={() => setQuery(term)}
          >
            <Ionicons name="trending-up" size={14} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={styles.chipText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.topBg} />
      
      {/* Premium Green Header matching Category Listing */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Search Products</Text>
            {query.length > 0 && <Text style={styles.headerSubtitle}>({results.length} found)</Text>}
          </View>
          <TouchableOpacity style={styles.headerRightBtn}>
            <Ionicons name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='Search "milk", "bread", etc.'
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {/* Filter Bar */}
        {(results.length > 0 || hasSearched) && (
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterBtn}>
               <Text style={styles.filterText}>Filter</Text>
               <Ionicons name="filter" size={14} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        )}

        {isSearching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : query.length === 0 ? (
          renderEmptyState()
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={() => Keyboard.dismiss()}
          />
        ) : hasSearched && results.length === 0 ? (
           <View style={styles.center}>
             <Ionicons name="search-outline" size={60} color="#e1e5e3" />
             <Text style={styles.noResultsText}>No products found for "{query}"</Text>
             <Text style={styles.noResultsSub}>Try checking your spelling or use general terms</Text>
           </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  
  header: {
    backgroundColor: theme.topBg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // SafeArea
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: FontFamily.bold, color: '#ffffff' },
  headerSubtitle: { fontSize: 13, fontFamily: FontFamily.medium, color: '#d1f0df' },
  headerRightBtn: { padding: 5 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.medium,
    color: '#1a1d1e',
    height: '100%',
  },
  clearBtn: { padding: 5 },
  
  content: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLow,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  filterText: { fontSize: 13, fontFamily: FontFamily.bold, color: theme.onSurfaceVariant, marginRight: 5 },

  emptyContainer: { padding: 20 },
  trendingTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 15 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  chipText: { fontSize: 13, fontFamily: FontFamily.medium, color: '#1a1d1e' },

  noResultsText: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1a1d1e', marginTop: 15 },
  noResultsSub: { fontSize: 13, fontFamily: FontFamily.medium, color: '#888', marginTop: 5, textAlign: 'center' },

  listContainer: { padding: 10, paddingBottom: 100 },
  
  // Product Card Matching Pattern
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    maxWidth: (width - 20 - 16) / 2, 
  },
  productImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.surfaceLow,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  prodImg: { width: '70%', height: '70%', resizeMode: 'contain' },
  prodName: { fontSize: 13, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 10, height: 38, lineHeight: 18 },
  
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
