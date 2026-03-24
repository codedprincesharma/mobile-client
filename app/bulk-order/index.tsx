import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createBulkOrder } from '../../src/api/services';

export default function BulkOrderScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    eventDate: '',
    deliveryDate: '',
    deliveryAddress: '',
    guestCount: '',
    packageType: 'custom',
    itemList: '',
    specialNote: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.eventType || !formData.eventDate || !formData.deliveryDate || !formData.deliveryAddress || !formData.guestCount) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await createBulkOrder({
        eventType: formData.eventType,
        eventDate: new Date(formData.eventDate).toISOString(),
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        deliveryAddress: formData.deliveryAddress,
        location: { latitude: 0, longitude: 0 }, // For MVP
        guestCount: parseInt(formData.guestCount) || 0,
        packageType: formData.packageType,
        itemList: formData.itemList.split(',').map(s => s.trim()), 
        specialNote: formData.specialNote
      });
      
      Alert.alert('Success', 'Your bulk order request has been submitted!', [
        { text: 'OK', onPress: () => router.push('/bulk-order/my-orders' as any) }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bulk Order Request</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.description}>
          Looking to order in large volumes? Fill out the form below and our sales team will get back to you with a custom quote.
        </Text>

        <Text style={styles.label}>Event Type * (e.g., Wedding, Birthday)</Text>
        <TextInput style={styles.input} value={formData.eventType} onChangeText={(text) => setFormData({...formData, eventType: text})} />

        <Text style={styles.label}>Event Date * (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={formData.eventDate} onChangeText={(text) => setFormData({...formData, eventDate: text})} placeholder="2026-12-01" />

        <Text style={styles.label}>Delivery Date * (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={formData.deliveryDate} onChangeText={(text) => setFormData({...formData, deliveryDate: text})} placeholder="2026-11-28" />

        <Text style={styles.label}>Delivery Address *</Text>
        <TextInput style={styles.input} value={formData.deliveryAddress} onChangeText={(text) => setFormData({...formData, deliveryAddress: text})} />

        <Text style={styles.label}>Estimated Guest Count *</Text>
        <TextInput style={styles.input} value={formData.guestCount} onChangeText={(text) => setFormData({...formData, guestCount: text})} keyboardType="numeric" />

        <Text style={styles.label}>Package Type (small, medium, wedding, custom)</Text>
        <TextInput style={styles.input} value={formData.packageType} onChangeText={(text) => setFormData({...formData, packageType: text.toLowerCase()})} />

        <Text style={styles.label}>Items / SKUs (comma separated)</Text>
        <TextInput style={styles.textArea} value={formData.itemList} onChangeText={(text) => setFormData({...formData, itemList: text})} multiline numberOfLines={3} placeholder="Cake, 50 Samosas, Drinks..." />

        <Text style={styles.label}>Special Notes</Text>
        <TextInput style={styles.textArea} value={formData.specialNote} onChangeText={(text) => setFormData({...formData, specialNote: text})} multiline numberOfLines={3} />

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { fontSize: 16, color: '#007AFF', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  formContainer: { padding: 20, paddingBottom: 50 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 30 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 20, backgroundColor: '#fafafa' },
  textArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 20, backgroundColor: '#fafafa', textAlignVertical: 'top', height: 100 },
  submitButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#99cfeb' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
