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
import { adminGetAllBulkOrders } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

export default function AdminBulkOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadBulkOrders();
  }, []);

  const loadBulkOrders = async () => {
    try {
      setLoading(true);
      const data = await adminGetAllBulkOrders();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Failed to load bulk orders', error);
      Alert.alert('Error', 'Failed to load wholesale requests');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>REQ #{item._id.slice(-6).toUpperCase()}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.label}>Requested Items:</Text>
        <Text style={styles.itemsText}>{item.itemsDescription}</Text>
        
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.valueText}>{item.user?.name || 'Unknown'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Quoted Price:</Text>
            <Text style={styles.valueText}>{item.quotationPrice ? `$${item.quotationPrice}` : 'Not Sent'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => Alert.alert('Action Required', 'Advanced bulk order workflows are being integrated.')}
      >
        <Text style={styles.actionBtnText}>Process Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bulk Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadBulkOrders}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No bulk requests found.</Text>
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
  listContent: { padding: 15 },
  orderCard: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderId: { fontSize: 16, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  statusBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: FontFamily.bold, color: '#666' },
  cardBody: { marginBottom: 15 },
  label: { fontSize: 12, color: '#999', fontFamily: FontFamily.medium, marginBottom: 2 },
  itemsText: { fontSize: 14, color: '#333', fontFamily: FontFamily.regular, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  valueText: { fontSize: 14, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  actionBtn: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 13, fontFamily: FontFamily.bold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#888', textAlign: 'center' }
});
