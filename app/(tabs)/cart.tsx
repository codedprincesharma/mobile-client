import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { Products as ProductImages, Icons } from '../../constants/Assets';
import { Colors, FontFamily } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Image source={Icons.bucket} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.browseText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{items.length} Items</Text>
      </View>
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.cartItem}>
            <Image 
              source={ProductImages[`p${(index % 16) + 1}` as keyof typeof ProductImages]} 
              style={styles.itemImage} 
            />
            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.product._id)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.itemPrice}>₹{item.product.price}</Text>
              
              <View style={styles.quantityRow}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                  >
                    <Text style={styles.quantityBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtotal}>₹{(item.product.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.promoBox}>
          <Image source={Icons.coupon} style={styles.promoIcon} />
          <Text style={styles.promoText}>Apply Coupon Code</Text>
          <Text style={styles.promoArrow}>›</Text>
        </View>

        <View style={styles.billContainer}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValueFree}>FREE</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  emptyIcon: { width: 100, height: 100, marginBottom: 20, tintColor: '#ccc' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 30, fontFamily: FontFamily.medium },
  browseButton: { backgroundColor: Colors.light.tint, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 },
  browseText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold },
  
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  itemCount: { fontSize: 14, color: '#888', fontFamily: FontFamily.medium },
  
  listContent: { padding: 20 },
  cartItem: { 
    flexDirection: 'row',
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 15, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2 
  },
  itemImage: { width: 90, height: 90, borderRadius: 10, marginRight: 15 },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1c1c1c', flex: 1, marginRight: 10 },
  removeText: { fontSize: 18, color: '#ccc', padding: 2 },
  itemPrice: { fontSize: 14, color: '#666', fontFamily: FontFamily.regular },
  
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  quantityControls: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    borderRadius: 8,
    padding: 4
  },
  quantityBtn: { 
    width: 28, 
    height: 28, 
    borderRadius: 6, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  quantityBtnText: { fontSize: 18, fontWeight: 'bold', color: Colors.light.tint },
  quantity: { fontSize: 16, marginHorizontal: 15, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  subtotal: { fontSize: 16, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  
  footer: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -5 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 20 
  },
  promoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff9fa', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#ffebed',
    marginBottom: 20
  },
  promoIcon: { width: 24, height: 24, marginRight: 12 },
  promoText: { flex: 1, fontSize: 14, fontFamily: FontFamily.bold, color: '#444' },
  promoArrow: { fontSize: 20, color: Colors.light.tint },

  billContainer: { marginBottom: 20 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: '#666', fontFamily: FontFamily.regular },
  billValue: { fontSize: 14, color: '#1c1c1c', fontFamily: FontFamily.medium },
  billValueFree: { fontSize: 14, color: '#2ecc71', fontFamily: FontFamily.bold },
  totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  totalLabel: { fontSize: 18, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  totalValue: { fontSize: 18, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },

  checkoutBtn: { 
    backgroundColor: Colors.light.tint, 
    paddingVertical: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  checkoutText: { color: '#fff', fontSize: 18, fontFamily: FontFamily.bold },
});
