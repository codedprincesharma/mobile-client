import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Image as RNImage
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  fetchProductById, 
  fetchCategories, 
  adminCreateProduct, 
  adminUpdateProduct,
  getImageKitAuth
} from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: '' 
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const catData = await fetchCategories();
      setCategories(catData.data || []);

      if (isEditing) {
        const prodData = await fetchProductById(id as string);
        const p = prodData.data;
        setFormData({
          name: p.name,
          description: p.description || '',
          price: p.price.toString(),
          stock: p.stock.toString(),
          category: p.category?._id || '',
          image: p.images?.[0] || ''
        });
      }
    } catch (error) {
      console.error('Failed to load data', error);
      Alert.alert('Error', 'Failed to load product/category data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      
      // 1. Get Auth Parameters from backend
      const auth = await getImageKitAuth();
      console.log('Fetched Auth Params:', auth);

      if (!auth.publicKey || !auth.signature || !auth.token) {
        throw new Error('Incomplete authentication parameters from server');
      }
      
      // 2. Prepare Form Data for ImageKit
      const formDataUpload = new FormData();
      
      // Handle file binary based on platform
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formDataUpload.append('file', blob, asset.fileName || 'product.jpg');
      } else {
        formDataUpload.append('file', {
          uri: asset.uri,
          name: asset.fileName || 'product.jpg',
          type: asset.mimeType || 'image/jpeg'
        } as any);
      }

      formDataUpload.append('publicKey', auth.publicKey);
      formDataUpload.append('signature', auth.signature);
      formDataUpload.append('expire', auth.expire.toString());
      formDataUpload.append('token', auth.token);
      formDataUpload.append('fileName', asset.fileName || `prod_${Date.now()}.jpg`);
      formDataUpload.append('folder', '/products');

      console.log('Uploading to ImageKit...');

      // 3. Upload to ImageKit
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await uploadResponse.json();
      console.log('ImageKit Response:', result);
      
      if (uploadResponse.ok) {
        setFormData({ ...formData, image: result.url });
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        console.error('Upload failed details:', result);
        Alert.alert('Upload Failed', result.message || 'Check browser console for details');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'An error occurred during image upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const { name, price, stock, category, image } = formData;
    
    if (!name || !price || !stock || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: image ? [image] : []
      };

      if (isEditing) {
        await adminUpdateProduct(id as string, payload);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await adminCreateProduct(payload);
        Alert.alert('Success', 'Product created successfully');
      }
      router.back();
    } catch (error: any) {
      console.error('Save failed', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name && isEditing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveHeaderText, loading && styles.disabledText]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.label}>Product Image *</Text>
          <View style={styles.imageSection}>
            {formData.image ? (
              <View style={styles.previewContainer}>
                <RNImage source={{ uri: formData.image }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImage} onPress={() => setFormData({ ...formData, image: '' })}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator color={Colors.light.tint} />
                ) : (
                  <>
                    <Text style={styles.uploadPlus}>+</Text>
                    <Text style={styles.uploadText}>Select Product Image</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput 
            style={styles.input} 
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g. Chocolate Cake"
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat._id}
                style={[
                  styles.categoryChip, 
                  formData.category === cat._id && styles.categoryChipActive
                ]}
                onPress={() => setFormData({ ...formData, category: cat._id })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.category === cat._id && styles.categoryChipTextActive
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Price ($) *</Text>
              <TextInput 
                style={styles.input} 
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput 
                style={styles.input} 
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Write something about the product..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity 
            style={[styles.saveBtn, (loading || uploading) && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={loading || uploading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{isEditing ? 'Update Product' : 'Add Product'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, color: '#333' },
  title: { fontSize: 20, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  saveHeaderText: { fontSize: 16, fontFamily: FontFamily.bold, color: Colors.light.tint },
  disabledText: { color: '#ccc' },
  scrollContent: { padding: 20 },
  form: { gap: 15 },
  label: { fontSize: 14, fontFamily: FontFamily.medium, color: '#666', marginBottom: 5 },
  imageSection: { marginBottom: 10 },
  uploadPlaceholder: { 
    height: 150, 
    borderWidth: 2, 
    borderColor: '#eee', 
    borderStyle: 'dashed', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fcfcfc'
  },
  uploadPlus: { fontSize: 40, color: '#bbb', marginBottom: 5 },
  uploadText: { fontSize: 14, color: '#888', fontFamily: FontFamily.medium },
  previewContainer: { position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 15 },
  removeImage: { 
    position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 
  },
  removeText: { color: '#fff', fontSize: 12, fontFamily: FontFamily.bold },
  input: { 
    backgroundColor: '#f9f9f9', 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: '#1c1c1c'
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 5 },
  categoryChip: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee'
  },
  categoryChipActive: { 
    backgroundColor: Colors.light.tint, 
    borderColor: Colors.light.tint 
  },
  categoryChipText: { fontSize: 13, color: '#666', fontFamily: FontFamily.medium },
  categoryChipTextActive: { color: '#fff' },
  saveBtn: { 
    backgroundColor: Colors.light.tint, 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 20,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  disabledBtn: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 18, fontFamily: FontFamily.bold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
