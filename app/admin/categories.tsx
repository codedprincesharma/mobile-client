import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchCategories, adminDeleteCategory } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

export default function AdminCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminDeleteCategory(id);
              loadCategories();
            } catch {
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const renderCategoryItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={1}>{item.description || 'No description'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => router.push({ pathname: '/admin/manage-category', params: { id: item._id } } as any)}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Categories</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => router.push('/admin/manage-category' as any)}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item: any) => item._id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No categories found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backText: { fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: 20, fontFamily: FontFamily.bold },
  addBtn: { backgroundColor: Colors.light.tint, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontFamily: FontFamily.bold },
  list: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  description: { fontSize: 13, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row' },
  editBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  deleteBtn: { backgroundColor: '#ffebee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnText: { fontSize: 13, fontFamily: FontFamily.medium },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontFamily: FontFamily.medium }
});
