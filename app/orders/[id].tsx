import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchOrderById } from '../../src/api/services';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder(id as string);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data.data);
    } catch (error) {
      console.error('Failed to load order timeline', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.breadcrumbText}>← Back to Orders</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Order Details</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={getStatusBadgeStyle(order.status)}>
          <Text style={getStatusTextStyle(order.status)}>{order.status}</Text>
        </View>
        <Text style={styles.dateText}>Placed on {new Date(order.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items?.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product?.name || 'Unknown Product'}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${order.totalAmount?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text style={styles.addressText}>{order.shippingAddress?.street}</Text>
        <Text style={styles.addressText}>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</Text>
        <Text style={styles.addressText}>{order.shippingAddress?.country}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, marginBottom: 20 },
  backButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { paddingTop: 40, paddingBottom: 10 },
  breadcrumbText: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  dateText: { fontSize: 14, color: '#888' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  itemQuantity: { fontSize: 14, color: '#666' },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#2ecc71' },
  addressText: { fontSize: 16, color: '#444', lineHeight: 24 },
});

const getStatusBadgeStyle = (status: string) => ({
  backgroundColor: status === 'Delivered' ? '#e8f8f5' : status === 'Pending' ? '#fef5e7' : '#eaf2f8', 
  paddingHorizontal: 15, 
  paddingVertical: 8, 
  borderRadius: 20, 
  alignSelf: 'flex-start' as const, 
  marginBottom: 10 
});

const getStatusTextStyle = (status: string) => ({
  color: status === 'Delivered' ? '#2ecc71' : status === 'Pending' ? '#f39c12' : '#007AFF', 
  fontWeight: 'bold' as const 
});
