import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchMyBulkOrders } from '../../src/api/services';

export default function MyBulkOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchMyBulkOrders();
      setOrders(data.data);
    } catch (error) {
      console.error('Failed to load bulk orders', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You haven't requested any bulk orders.</Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/bulk-order')}>
          <Text style={styles.browseText}>Request Bulk Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.browseButton, { marginTop: 15, backgroundColor: '#666' }]} onPress={() => router.back()}>
          <Text style={styles.browseText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bulk Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderEvent}>{item.eventType} Event</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderStatus}>Status: <Text style={getStatusStyle(item.status)}>{item.status}</Text></Text>
              {item.quotationPrice ? (
                <Text style={styles.orderTotal}>Quote: ${item.quotationPrice}</Text>
              ) : null}
            </View>
            <Text style={styles.detailText}>Event Date: {formatDate(item.eventDate)} | Guests: {item.guestCount}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 20 },
  browseButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, paddingHorizontal: 30 },
  browseText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  backButton: { fontSize: 16, color: '#007AFF', marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold' },
  orderCard: { backgroundColor: '#fff', padding: 20, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderEvent: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  orderDate: { fontSize: 14, color: '#888' },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderStatus: { fontSize: 16, color: '#444' },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },
  detailText: { fontSize: 14, color: '#666' }
});

const getStatusStyle = (status: string) => ({
  fontWeight: 'bold' as const,
  color: ['delivered', 'approved'].includes(status) ? '#2ecc71' : status === 'pending' ? '#f39c12' : '#007AFF'
});
