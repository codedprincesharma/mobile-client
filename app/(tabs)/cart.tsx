import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Dimensions, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { Products as ProductImages } from '../../constants/Assets';
import { FontFamily } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#008e42',
  topBg: '#00a350',
  surface: '#ffffff',
  surfaceLow: '#f9f9f9',
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState('15');

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cart-outline" size={80} color={theme.onSurfaceVariant} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.browseText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const shippingFee = 0.00; // Free shipping in reference
  const grandTotal = totalPrice + shippingFee;

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)')}>
           <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity style={styles.headerRightBtn}>
           <Ionicons name="cart-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cart</Text>
          
          <View style={styles.itemsContainer}>
            {items.map((item, index) => {
              // Local vs Remote Image handling
              let productImage: any = null;
              if (ProductImages && (ProductImages as any)[`p${(index % 16) + 1}`]) {
                productImage = (ProductImages as any)[`p${(index % 16) + 1}`];
              } else {
                productImage = { uri: item.product.images?.[0] || 'https://via.placeholder.com/150' };
              }

              return (
                <View key={item.product._id} style={styles.cartItem}>
                  <View style={styles.itemImageContainer}>
                    <Image source={productImage} style={styles.itemImage} />
                  </View>
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.itemPrice}>${item.product.price}</Text>
                  </View>

                  <View style={styles.itemRightCol}>
                     <Text style={styles.itemTotalPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                     
                     <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          style={styles.qtyBtn}
                          onPress={() => {
                            if (item.quantity === 1) removeFromCart(item.product._id);
                            else updateQuantity(item.product._id, item.quantity - 1);
                          }}
                        >
                          <Ionicons name="remove" size={16} color="#aaa" />
                        </TouchableOpacity>
                        
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        
                        <TouchableOpacity 
                          style={styles.qtyBtnAdd}
                          onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                     </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.billContainer}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Shipping fee</Text>
            <Text style={styles.billValue}>${shippingFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.billDivider} />
          
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mainPayBtn} activeOpacity={0.8}>
           <Text style={styles.mainPayText}>Proceed to Pay</Text>
        </TouchableOpacity>

        {/* Delivery Time-slot */}
        <View style={styles.timeSlotSection}>
          <Text style={styles.sectionTitle}>Delivery Time-slot</Text>
          <View style={styles.radioContainer}>
             
             <TouchableOpacity 
               style={[styles.radioItem, selectedTime === '15' && styles.radioItemActive]}
               onPress={() => setSelectedTime('15')}
               activeOpacity={0.9}
             >
                <View style={styles.radioOuter}>
                  {selectedTime === '15' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Delivery in 15 mins</Text>
                {selectedTime === '15' && <Ionicons name="chevron-down" size={20} color={theme.onSurfaceVariant} style={{marginLeft: 'auto'}}/>}
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.radioItem, selectedTime === '3' && styles.radioItemActive]}
               onPress={() => setSelectedTime('3')}
               activeOpacity={0.9}
             >
                <View style={styles.radioOuter}>
                  {selectedTime === '3' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Delivery in 3 mins</Text>
             </TouchableOpacity>

          </View>
        </View>
        
        <TouchableOpacity style={styles.mainPayBtn} activeOpacity={0.8}>
           <Text style={styles.mainPayText}>Proceed to Pay</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: theme.surface 
  },
  emptyText: { 
    fontSize: 18, 
    color: theme.onSurface, 
    marginTop: 20,
    marginBottom: 30, 
    fontFamily: FontFamily.bold 
  },
  browseButton: { 
    backgroundColor: theme.primary, 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 30 
  },
  browseText: { 
    color: '#fff', 
    fontSize: 16, 
    fontFamily: FontFamily.bold 
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.topBg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // SafeArea
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: '#ffffff',
  },
  headerRightBtn: { padding: 5 },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface, marginBottom: 15 },
  
  itemsContainer: { gap: 15 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: theme.surfaceLow,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: theme.onSurface,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: theme.onSurfaceVariant,
  },
  
  itemRightCol: { alignItems: 'flex-end' },
  itemTotalPrice: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: theme.onSurface,
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLow,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eee'
  },
  qtyBtn: {
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnAdd: {
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: 12
  },
  qtyText: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: theme.onSurface,
    marginHorizontal: 10,
  },

  billContainer: { marginBottom: 25 },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billLabel: { fontSize: 15, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant },
  billValue: { fontSize: 15, fontFamily: FontFamily.medium, color: theme.onSurface },
  billDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  billTotalLabel: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },
  billTotalValue: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },

  mainPayBtn: {
    backgroundColor: theme.primary,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  mainPayText: { color: '#fff', fontSize: 18, fontFamily: FontFamily.bold },

  timeSlotSection: { marginBottom: 30 },
  radioContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    overflow: 'hidden'
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radioItemActive: {
    backgroundColor: '#f7fdfa' // faint green
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc',
    marginRight: 12, alignItems: 'center', justifyContent: 'center'
  },
  radioInner: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary
  },
  radioText: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    color: theme.onSurface,
  }
});
