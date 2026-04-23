import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { adminCreateCategory, adminUpdateCategory, fetchCategories } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

export default function ManageCategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (id) {
      loadCategory(id as string);
    }
  }, [id]);

  const loadCategory = async (catId: string) => {
    setFetching(true);
    try {
      const data = await fetchCategories();
      const category = data.data.find((c: any) => c._id === catId);
      if (category) {
        setName(category.name);
        setDescription(category.description);
      }
    } catch {
      Alert.alert('Error', 'Failed to load category details');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await adminUpdateCategory(id as string, { name, description });
      } else {
        await adminCreateCategory({ name, description });
      }
      Alert.alert('Success', `Category ${id ? 'updated' : 'created'} successfully!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{id ? 'Edit Category' : 'Add Category'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fruits & Vegetables"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe this category..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#bbb"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.disabledBtn]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Saving...' : id ? 'Update Category' : 'Create Category'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  content: { paddingBottom: 40 },
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
  formCard: { backgroundColor: '#fff', margin: 20, padding: 25, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontFamily: FontFamily.bold, color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 1.5, borderColor: '#f0f0f0', paddingVertical: 12, fontSize: 16, fontFamily: FontFamily.medium, color: '#1c1c1c' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: Colors.light.tint, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, shadowColor: Colors.light.tint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
