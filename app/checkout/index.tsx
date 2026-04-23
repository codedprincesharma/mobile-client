import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { createOrder } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';
import { Icons } from '../../constants/Assets';



export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      Alert.alert('Error', 'Please fill out all address fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({
          product: i.product._id,
          quantity: i.quantity
        })),
        address: {
          street,
          city,
          state,
          zipCode
        },
        paymentMethod: 'cod'
      };

      await createOrder(orderData);
      clearCart();
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'OK', onPress: () => router.replace('/orders' as any) }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main St"
            value={street}
            onChangeText={setStreet}
            placeholderTextColor="#bbb"
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="New York"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#bbb"
            />
          </View>
          <View style={[styles.inputGroup, { width: 80 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="NY"
              value={state}
              onChangeText={setState}
              placeholderTextColor="#bbb"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Zip Code</Text>
          <TextInput
            style={styles.input}
            placeholder="10001"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            placeholderTextColor="#bbb"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={[styles.card, styles.paymentCard]}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentOption}>
            <View style={styles.radioActive} />
            <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
          </View>
          <Image source={Icons.delivery} style={styles.paymentIcon} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bill Details</Text>
      <View style={styles.card}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Item Total</Text>
          <Text style={styles.billValue}>₹{totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={styles.billValueFree}>FREE</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Platform handling</Text>
          <Text style={styles.billValue}>₹0.00</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.billRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.placeOrderBtn, loading && styles.disabledBtn]} 
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderText}>
          {loading ? 'Processing...' : `Place Order • ₹${totalPrice.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 20, paddingBottom: 60 },
  header: { paddingTop: 40, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
  backCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  backIcon: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.bold, color: '#1c1c1c', marginTop: 10, marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontFamily: FontFamily.medium, color: '#888', marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, fontSize: 16, fontFamily: FontFamily.regular, color: '#1c1c1c' },
  row: { flexDirection: 'row' },
  
  paymentCard: { borderLeftWidth: 4, borderLeftColor: Colors.light.tint },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentOption: { flexDirection: 'row', alignItems: 'center' },
  radioActive: { width: 20, height: 20, borderRadius: 10, borderWidth: 6, borderColor: Colors.light.tint, marginRight: 12 },
  paymentText: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  paymentIcon: { width: 24, height: 24, tintColor: Colors.light.tint },
  
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: 14, color: '#666', fontFamily: FontFamily.regular },
  billValue: { fontSize: 14, color: '#1c1c1c', fontFamily: FontFamily.medium },
  billValueFree: { fontSize: 14, color: '#2ecc71', fontFamily: FontFamily.bold },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  totalLabel: { fontSize: 18, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  totalValue: { fontSize: 18, fontFamily: FontFamily.extraBold, color: Colors.light.tint },
  
  placeOrderBtn: { 
    backgroundColor: Colors.light.tint, 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  disabledBtn: { opacity: 0.6 },
  placeOrderText: { color: '#fff', fontSize: 18, fontFamily: FontFamily.bold },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 20, fontFamily: FontFamily.medium },
  backButtonLarge: { backgroundColor: Colors.light.tint, padding: 15, borderRadius: 10 },
  backButtonText: { color: '#fff', fontFamily: FontFamily.bold },
});

