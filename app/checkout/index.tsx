import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { createOrder, fetchSettings } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';
import { Icons } from '../../constants/Assets';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ── Haversine (client-side preview — server revalidates) ────────────────────
function haversineKm(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcDeliveryCharge(
  distanceKm: number,
  rules: { freeDeliveryRadius: number; baseCharge: number; perKmCharge: number }
): number {
  if (distanceKm <= rules.freeDeliveryRadius) return 0;
  const extra = distanceKm - rules.freeDeliveryRadius;
  return Math.round((rules.baseCharge + extra * rules.perKmCharge) * 100) / 100;
}

export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Pricing state
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [outOfRange, setOutOfRange] = useState(false);

  // ── Fetch settings on mount ──────────────────────────────────────────────
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchSettings();
      if (res?.data) setSettings(res.data);
    } catch (e) {
      console.warn('Could not load settings, using defaults');
    } finally {
      setSettingsLoading(false);
    }
  };

  // ── Recalculate pricing whenever deps change ─────────────────────────────
  useEffect(() => {
    const subtotal = totalPrice;
    const gstPct = settings?.gstPercentage ?? 18;
    const gst = Math.round((subtotal * gstPct) / 100 * 100) / 100;
    setGstAmount(gst);

    if (settings && userCoords) {
      const storeCoords: [number, number] = settings.storeLocation?.coordinates || [0, 0];
      const hasStore = storeCoords[0] !== 0 && storeCoords[1] !== 0;

      if (hasStore) {
        const dist = Math.round(haversineKm(storeCoords, userCoords) * 100) / 100;
        setDeliveryDistance(dist);

        if (dist > (settings.deliveryCharges?.maxDeliveryRadius ?? 25)) {
          setOutOfRange(true);
          setDeliveryCharge(0);
          setGrandTotal(0);
          return;
        }

        setOutOfRange(false);
        const charge = calcDeliveryCharge(dist, settings.deliveryCharges);
        setDeliveryCharge(charge);
        setGrandTotal(Math.round((subtotal + gst + charge) * 100) / 100);
        return;
      }
    }

    // No valid coords — free delivery
    setOutOfRange(false);
    setDeliveryDistance(0);
    setDeliveryCharge(0);
    setGrandTotal(Math.round((subtotal + gst) * 100) / 100);
  }, [totalPrice, settings, userCoords]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const reverseGeocodeLocation = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (results.length > 0) {
        const location = results[0];
        return {
          street: `${location.streetNumber || ''} ${location.street || 'Unknown Street'}`.trim(),
          city: location.city || 'Unknown City',
          state: location.region || 'Unknown State',
          zipCode: location.postalCode || '0000',
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is required to use this feature.');
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      setUserCoords([longitude, latitude]);
      
      const addressData = await reverseGeocodeLocation(latitude, longitude);
      
      if (addressData) {
        setStreet(addressData.street);
        setCity(addressData.city);
        setState(addressData.state);
        setZipCode(addressData.zipCode);
        Alert.alert('Success', 'Location auto-filled successfully!');
      } else {
        Alert.alert('Error', 'Could not fetch address from location. Please enter manually.');
      }
    } catch (error: any) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to fetch current location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      Alert.alert('Error', 'Please fill out all address fields');
      return;
    }

    if (outOfRange) {
      Alert.alert('Out of Range', `Delivery is not available beyond ${settings?.deliveryCharges?.maxDeliveryRadius ?? 25} km. Please choose a closer address.`);
      return;
    }

    setLoading(true);
    try {
      // Get GPS coordinates for order
      let locationCoordinates: [number, number] = userCoords || [0, 0];
      if (!userCoords) {
        try {
          const hasPermission = await requestLocationPermission();
          if (hasPermission) {
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const { longitude, latitude } = currentLocation.coords;
            locationCoordinates = [longitude, latitude];
          }
        } catch (locError) {
          console.warn('Could not capture GPS location for order:', locError);
        }
      }

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
        location: {
          coordinates: locationCoordinates
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
      console.error('Order placement error:', error);
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

  const gstPct = settings?.gstPercentage ?? 18;
  const freeRadius = settings?.deliveryCharges?.freeDeliveryRadius ?? 3;
  const isFreeDelivery = deliveryCharge === 0 && !outOfRange;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery Address</Text>
      
      <TouchableOpacity 
        style={styles.useLocationButton}
        onPress={handleUseCurrentLocation}
        disabled={locationLoading}
      >
        <Ionicons name="locate" size={18} color="#fff" />
        <Text style={styles.useLocationText}>
          {locationLoading ? 'Getting Location...' : 'Use Current Location'}
        </Text>
        {locationLoading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
      </TouchableOpacity>

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
          <Text style={styles.billLabel}>GST ({gstPct}%)</Text>
          <Text style={styles.billValue}>₹{gstAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          {isFreeDelivery ? (
            <View style={styles.freeDeliveryBadge}>
              <Ionicons name="bicycle" size={14} color="#2ecc71" />
              <Text style={styles.billValueFree}> FREE</Text>
            </View>
          ) : outOfRange ? (
            <Text style={styles.billValueError}>Out of range</Text>
          ) : (
            <Text style={styles.billValue}>₹{deliveryCharge.toFixed(2)}</Text>
          )}
        </View>

        {deliveryDistance > 0 && (
          <View style={styles.distanceRow}>
            <Ionicons name="navigate-outline" size={14} color="#888" />
            <Text style={styles.distanceText}>
              {deliveryDistance.toFixed(1)} km from store
              {deliveryDistance <= freeRadius && ' (within free zone)'}
            </Text>
          </View>
        )}

        {outOfRange && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color="#e74c3c" />
            <Text style={styles.errorText}>
              Delivery not available beyond {settings?.deliveryCharges?.maxDeliveryRadius} km. Distance: {deliveryDistance.toFixed(1)} km.
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.billRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>
            {outOfRange ? '—' : `₹${grandTotal.toFixed(2)}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.placeOrderBtn, (loading || outOfRange) && styles.disabledBtn]} 
        onPress={handlePlaceOrder}
        disabled={loading || outOfRange}
      >
        <Text style={styles.placeOrderText}>
          {loading
            ? 'Processing...'
            : outOfRange
              ? 'Delivery Unavailable'
              : `Place Order • ₹${grandTotal.toFixed(2)}`}
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
  
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  billLabel: { fontSize: 14, color: '#666', fontFamily: FontFamily.regular },
  billValue: { fontSize: 14, color: '#1c1c1c', fontFamily: FontFamily.medium },
  billValueFree: { fontSize: 14, color: '#2ecc71', fontFamily: FontFamily.bold },
  billValueError: { fontSize: 14, color: '#e74c3c', fontFamily: FontFamily.bold },
  freeDeliveryBadge: { flexDirection: 'row', alignItems: 'center' },
  
  distanceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fa', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10,
    gap: 6,
  },
  distanceText: { fontSize: 13, color: '#888', fontFamily: FontFamily.medium },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef0ef',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fddcda',
  },
  errorText: { fontSize: 13, color: '#c0392b', fontFamily: FontFamily.medium, flex: 1 },

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
  
  useLocationButton: { 
    backgroundColor: '#008e42', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  useLocationText: { 
    color: '#fff', 
    fontSize: 14, 
    fontFamily: FontFamily.bold,
  },
});
