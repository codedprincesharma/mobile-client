import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { createBulkOrder } from '../../src/api/services';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '../../constants/theme';

const theme = {
  primary: '#008e42',
  topBg: '#e9f5ed',
  surface: '#ffffff',
  surfaceLow: '#f4f6f5',
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

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

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[styles.input, multiline && styles.textArea]} 
        value={value} 
        onChangeText={onChangeText} 
        placeholder={placeholder}
        placeholderTextColor="#bcc3c0"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.topBg} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Bulk Request</Text>
        <TouchableOpacity onPress={() => router.push('/bulk-order/my-orders' as any)} style={styles.historyBtn}>
           <Ionicons name="list" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.heroCard}>
             <View style={styles.heroIconBubble}>
                <Ionicons name="cube" size={32} color={theme.primary} />
             </View>
             <Text style={styles.heroTitle}>Planning a big event?</Text>
             <Text style={styles.heroDesc}>
               Fill out the form below and our sales team will get back to you with a custom quote tailored to your needs.
             </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            <InputField label="Event Type *" value={formData.eventType} onChangeText={(text: string) => setFormData({...formData, eventType: text})} placeholder="e.g., Wedding, Corporate" />
            
            <View style={styles.row}>
               <View style={styles.flexHalf}>
                  <InputField label="Event Date *" value={formData.eventDate} onChangeText={(text: string) => setFormData({...formData, eventDate: text})} placeholder="YYYY-MM-DD" />
               </View>
               <View style={styles.flexHalf}>
                  <InputField label="Delivery Date *" value={formData.deliveryDate} onChangeText={(text: string) => setFormData({...formData, deliveryDate: text})} placeholder="YYYY-MM-DD" />
               </View>
            </View>

            <InputField label="Guest Count *" value={formData.guestCount} onChangeText={(text: string) => setFormData({...formData, guestCount: text})} placeholder="e.g., 500" keyboardType="numeric" />
            
            <InputField label="Delivery Address *" value={formData.deliveryAddress} onChangeText={(text: string) => setFormData({...formData, deliveryAddress: text})} placeholder="Full delivery address" />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Order Requirements</Text>

            <InputField label="Package Type" value={formData.packageType} onChangeText={(text: string) => setFormData({...formData, packageType: text.toLowerCase()})} placeholder="Small, Medium, Custom" />
            
            <InputField label="Items / SKUs" value={formData.itemList} onChangeText={(text: string) => setFormData({...formData, itemList: text})} placeholder="Cake, 50 Samosas, Drinks..." multiline />
            
            <InputField label="Special Notes" value={formData.specialNote} onChangeText={(text: string) => setFormData({...formData, specialNote: text})} placeholder="Any special dietary requirements or delivery instructions?" multiline />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Request</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surfaceLow },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingTop: 15, 
    paddingBottom: 20, 
    backgroundColor: theme.topBg 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  historyBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  title: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },
  
  container: { flex: 1 },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  heroCard: { backgroundColor: theme.topBg, padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  heroIconBubble: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  heroTitle: { fontSize: 20, fontFamily: FontFamily.extraBold, color: '#000', marginBottom: 8 },
  heroDesc: { fontSize: 13, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000', marginBottom: 20 },
  
  row: { flexDirection: 'row', gap: 15 },
  flexHalf: { flex: 1 },
  
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 12, fontFamily: FontFamily.bold, color: theme.onSurfaceVariant, marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: theme.surfaceLow, borderWidth: 1, borderColor: '#e1e5e3', borderRadius: 12, padding: 14, fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurface },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  submitButton: { backgroundColor: theme.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: theme.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  disabledButton: { backgroundColor: '#80c7a1' },
  submitText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold },
});
