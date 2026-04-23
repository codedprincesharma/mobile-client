import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

const STATUS_COLORS: any = {
  'pending': '#FF9800',
  'confirmed': '#2196F3',
  'out_for_delivery': '#9C27B0',
  'delivered': '#4CAF50',
  'cancelled': '#F44336'
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminGetAllOrders();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Failed to load orders', error);
      Alert.alert('Error', 'Failed to load system orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const statuses = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
    
    Alert.alert(
      'Update Order Status',
      'Select new status for this order:',
      statuses.map(status => ({
        text: status.toUpperCase(),
        onPress: async () => {
          try {
            await adminUpdateOrderStatus(orderId, status);
            setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
            Alert.alert('Success', `Order marked as ${status}`);
          } catch {
            Alert.alert('Error', 'Failed to update status');
          }
        },
        style: status === 'cancelled' ? 'destructive' : 'default'
      })).concat([{ text: 'Cancel', style: 'cancel' }] as any)
    );
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderUser}>{item.user?.name || 'Unknown User'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <Text style={styles.orderItems}>
          {item.items.map((i: any) => `${i.quantity}x ${i.product?.name || 'Product'}`).join(', ')}
        </Text>
        <Text style={styles.orderPrice}>Total: ${item.totalAmount.toFixed(2)}</Text>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.detailsBtn} 
          onPress={() => router.push(`/orders/track/${item._id}` as any)}
        >
          <Text style={styles.btnText}>Track / View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.updateBtn} 
          onPress={() => handleUpdateStatus(item._id, item.status)}
        >
          <Text style={styles.updateBtnText}>Update Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
            <TouchableOpacity 
              key={s} 
              style={[styles.filterChip, filter === s && styles.filterChipActive]}
              onPress={() => setFilter(s)}
            >
              <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadOrders}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No orders found.</Text>
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
  backBtn: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1c' },
  title: { fontSize: 20, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  filterSection: { backgroundColor: '#fff', paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 15 },
  filterChip: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#f0f0f0', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  filterChipActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  filterText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 15 },
  orderCard: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  orderId: { fontSize: 16, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  orderUser: { fontSize: 13, color: '#888', fontFamily: FontFamily.medium },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: FontFamily.bold },
  orderBody: { borderBottomWidth: 1, borderBottomColor: '#f4f4f4', paddingBottom: 15, marginBottom: 15 },
  orderItems: { fontSize: 14, color: '#555', fontFamily: FontFamily.regular, marginBottom: 5 },
  orderPrice: { fontSize: 16, fontFamily: FontFamily.bold, color: Colors.light.tint },
  orderDate: { fontSize: 12, color: '#999', marginTop: 5 },
  actions: { flexDirection: 'row', gap: 10 },
  detailsBtn: { flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, alignItems: 'center' },
  updateBtn: { flex: 1, backgroundColor: Colors.light.tint + '10', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.light.tint + '30' },
  btnText: { fontSize: 13, fontFamily: FontFamily.medium, color: '#333' },
  updateBtnText: { fontSize: 13, fontFamily: FontFamily.bold, color: Colors.light.tint },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#888', textAlign: 'center' }
});
