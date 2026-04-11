import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchOrders } from '../../src/api/services';
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

export default function OrderAgainScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      const ordersList = Array.isArray(data) ? data : (data.data || []);
      
      setOrders(ordersList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const options: any = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return 'Recent';
    }
  };

  const renderOrderItems = (items: any[]) => {
    if (!items || items.length === 0) return <Text style={styles.itemNames}>No items info</Text>;
    
    const names = items.slice(0, 2).map((i: any) => i.product?.name || `Item (${i.quantity}x)`).join(', ');
    const extraCount = items.length > 2 ? items.length - 2 : 0;
    
    return (
      <Text style={styles.itemNames} numberOfLines={1}>
        {names}{extraCount > 0 ? ` +${extraCount} more` : ''}
      </Text>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surfaceLow} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surfaceLow} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Again</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={theme.onSurface} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
           <View style={styles.emptyIconCircle}>
             <Ionicons name="receipt-outline" size={48} color={theme.primary} />
           </View>
           <Text style={styles.emptyTitle}>No Previous Orders</Text>
           <Text style={styles.emptyDesc}>Once you place an order, your items will appear here for ultra-fast reordering.</Text>
           <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
               <Text style={styles.shopBtnText}>Start Shopping</Text>
           </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => item._id || String(index)}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
               <View style={styles.orderTopRow}>
                  <View style={styles.dateBadge}>
                     <Ionicons name="calendar-outline" size={13} color="#555" style={{marginRight: 6}} />
                     <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.priceText}>₹{item.totalAmount || item.totalPrice || 0}</Text>
               </View>

               <View style={styles.orderDivider} />

               <View style={styles.orderItemRow}>
                  <View style={styles.itemImagePlaceholder}>
                     <Ionicons name="basket" size={26} color="#cdd5d1" />
                  </View>
                  <View style={styles.itemDetails}>
                     <Text style={styles.statusText}>
                        <Text style={{color: item.status?.toLowerCase() === 'delivered' ? theme.primary : '#e67e22'}}>{(item.status || 'COMPLETED').toUpperCase()}</Text>
                     </Text>
                     {renderOrderItems(item.items)}
                  </View>
               </View>

               <TouchableOpacity style={styles.reorderBtn} activeOpacity={0.8}>
                 <Ionicons name="cart" size={18} color="#fff" style={{marginRight: 6}} />
                 <Text style={styles.reorderBtnText}>Add Items to Cart</Text>
               </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surfaceLow },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 15, 
    backgroundColor: theme.surfaceLow 
  },
  headerTitle: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#000', letterSpacing: -0.5 },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  
  listContainer: { padding: 15, paddingBottom: 40 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  emptyTitle: { fontSize: 22, fontFamily: FontFamily.bold, color: '#000', marginBottom: 10 },
  emptyDesc: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  shopBtn: { backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  shopBtnText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold },

  orderCard: { backgroundColor: theme.surface, borderRadius: 20, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surfaceLow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  dateText: { fontSize: 12, fontFamily: FontFamily.bold, color: '#444' },
  priceText: { fontSize: 18, fontFamily: FontFamily.extraBold, color: '#000' },
  
  orderDivider: { height: 1.5, backgroundColor: theme.surfaceLow, borderStyle: 'dashed', marginBottom: 15, borderRadius: 1 },
  
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemImagePlaceholder: { width: 50, height: 50, borderRadius: 12, backgroundColor: theme.surfaceLow, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemDetails: { flex: 1 },
  statusText: { fontSize: 11, fontFamily: FontFamily.extraBold, marginBottom: 4, letterSpacing: 0.5 },
  itemNames: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurface, lineHeight: 20 },
  
  reorderBtn: { flexDirection: 'row', backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  reorderBtnText: { color: '#fff', fontSize: 15, fontFamily: FontFamily.bold }
});
