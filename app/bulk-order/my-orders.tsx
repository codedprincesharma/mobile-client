import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchMyBulkOrders } from '../../src/api/services';
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
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
      </TouchableOpacity>
      <Text style={styles.title}>My Bulk Orders</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const getStatusBadge = (status: string) => {
    let bgColor = '#e3f2fd';
    let textColor = '#1565c0';
    
    if (['delivered', 'approved'].includes(status.toLowerCase())) {
        bgColor = '#e8f5e9';
        textColor = '#2e7d32';
    } else if (status.toLowerCase() === 'pending') {
        bgColor = '#fff8e1';
        textColor = '#f57f17';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
         <Text style={[styles.statusText, { color: textColor }]}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.center}>
          <View style={styles.emptyIconCircle}>
             <Ionicons name="cube-outline" size={48} color={theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Bulk Orders Yet</Text>
          <Text style={styles.emptyText}>You haven't requested any bulk orders for your events.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/bulk-order')}>
            <Text style={styles.primaryButtonText}>Request Bulk Order</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      {renderHeader()}
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard} activeOpacity={0.9}>
            <View style={styles.orderHeaderRow}>
              <View style={styles.orderTitleBox}>
                 <View style={styles.eventIcon}>
                    <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                 </View>
                 <Text style={styles.orderEvent}>{item.eventType} Event</Text>
              </View>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
            
            <View style={styles.orderDivider} />
            
            <View style={styles.orderBody}>
               <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Event Date</Text>
                  <Text style={styles.detailValue}>{formatDate(item.eventDate)}</Text>
               </View>
               <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Guests</Text>
                  <Text style={styles.detailValue}>{item.guestCount}</Text>
               </View>
               <View style={[styles.detailCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.detailLabel}>Status</Text>
                  {getStatusBadge(item.status)}
               </View>
            </View>

            {item.quotationPrice && (
              <View style={styles.quoteRow}>
                <Text style={styles.quoteText}>Custom Quote Provided:</Text>
                <Text style={styles.quotePrice}>₹{item.quotationPrice}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surfaceLow },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 15, 
    backgroundColor: theme.surface 
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },
  
  listContainer: { padding: 15, paddingBottom: 40 },
  
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: FontFamily.bold, color: theme.onSurface, marginBottom: 10 },
  emptyText: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  
  primaryButton: { backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontFamily: FontFamily.bold },

  orderCard: { 
    backgroundColor: theme.surface, 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2 
  },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  orderTitleBox: { flexDirection: 'row', alignItems: 'center' },
  eventIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  orderEvent: { fontSize: 16, fontFamily: FontFamily.bold, color: theme.onSurface },
  orderDate: { fontSize: 12, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant },
  
  orderDivider: { height: 1, backgroundColor: theme.surfaceLow, marginBottom: 15 },
  
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, marginBottom: 4 },
  detailValue: { fontSize: 14, fontFamily: FontFamily.bold, color: theme.onSurface },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontFamily: FontFamily.extraBold, letterSpacing: 0.5 },

  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, backgroundColor: theme.topBg, padding: 12, borderRadius: 10 },
  quoteText: { fontSize: 13, fontFamily: FontFamily.bold, color: theme.primary },
  quotePrice: { fontSize: 16, fontFamily: FontFamily.extraBold, color: theme.onSurface },
});
