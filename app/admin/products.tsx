import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchProducts, adminDeleteProduct } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';


export default function AdminProductListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Failed to load products', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminDeleteProduct(id);
              setProducts(products.filter(p => p._id !== id));
            } catch (error) {
              console.error('Delete failed', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category?.name || 'Category'}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => router.push({ pathname: '/admin/manage-product', params: { id: item._id } } as any)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDelete(item._id, item.name)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Products</Text>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => router.push('/admin/manage-product' as any)}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1c' },
  title: { fontSize: 20, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  addBtn: { 
    backgroundColor: Colors.light.tint, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  addBtnText: { color: '#fff', fontFamily: FontFamily.bold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  listContent: { padding: 15 },
  productCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  productImage: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1c1c1c', marginBottom: 2 },
  productCategory: { fontSize: 13, color: '#888', marginBottom: 4 },
  productPrice: { fontSize: 15, fontFamily: FontFamily.bold, color: Colors.light.tint },
  actions: { justifyContent: 'space-around', alignItems: 'flex-end' },
  editBtn: { 
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6,
    marginBottom: 8
  },
  deleteBtn: { 
    backgroundColor: '#ffebee', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  actionText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#333' },
  emptyText: { color: '#888', textAlign: 'center' }
});
