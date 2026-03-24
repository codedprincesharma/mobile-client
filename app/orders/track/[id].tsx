import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapComponent from '../../../components/MapComponent';
import * as Location from 'expo-location';
import { useSocket } from '../../../src/context/SocketContext';
import { fetchMe, fetchOrderById } from '../../../src/api/services';

interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
}

export default function DeliveryTrackingScreen() {
  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Map State
  const [deliveryLocation, setDeliveryLocation] = useState<LocationData | null>(null);
  const [customerLocation, setCustomerLocation] = useState<LocationData | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LocationData[]>([]);
  
  const mapRef = useRef<any>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (orderId && isConnected && socket) {
      initTracking(orderId as string);
    }
    return () => {
      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }
      if (socket && orderId) {
        socket.emit('leaveOrderRoom', orderId);
      }
    };
  }, [orderId, isConnected, socket]);

  const initTracking = async (orderId: string) => {
    try {
      // 1. Fetch User and Order Data
      const [userRes, orderRes] = await Promise.all([
        fetchMe(),
        fetchOrderById(orderId)
      ]);
      const currentUser = userRes.data;
      const currentOrder = orderRes.data;
      
      setUser(currentUser);
      setOrder(currentOrder);

      // Set Customer Destination Marker
      const custLat = currentOrder.shippingAddress?.latitude || 37.78825;
      const custLng = currentOrder.shippingAddress?.longitude || -122.4324;
      setCustomerLocation({ latitude: custLat, longitude: custLng });

      // 2. Setup Socket Listeners
      if (socket) {
        socket.emit('joinOrderRoom', orderId);

        socket.on('locationUpdated', (data: LocationData) => {
          setDeliveryLocation(data);
          setRouteCoordinates(prev => [...prev, data]);
          
          if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
            mapRef.current.animateToRegion({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
        });
      }

      // 3. If User is Delivery Role, Setup GPS Emission
      if (currentUser.role === 'delivery' || currentUser.role === 'admin') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permissions are required to track delivery.');
          return;
        }

        const initialLoc = await Location.getCurrentPositionAsync({});
        const initCoords = {
          latitude: initialLoc.coords.latitude,
          longitude: initialLoc.coords.longitude,
          heading: initialLoc.coords.heading || 0
        };
        setDeliveryLocation(initCoords);
        socket?.emit('updateLocation', { orderId, ...initCoords });

        locationSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (location) => {
            const coords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading || 0
            };
            setDeliveryLocation(coords);
            socket?.emit('updateLocation', { orderId, ...coords });
          }
        );
      }

    } catch (error) {
      console.error('Failed to init tracking:', error);
      Alert.alert('Error', 'Unable to start tracking.');
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

  const initialRegion = {
    latitude: deliveryLocation?.latitude || customerLocation?.latitude || 37.78825,
    longitude: deliveryLocation?.longitude || customerLocation?.longitude || -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to Order</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Tracking</Text>
        <Text style={styles.statusId}>Order #{orderId?.slice(-6)}</Text>
      </View>

      <MapComponent 
        ref={mapRef}
        style={styles.map} 
        initialRegion={initialRegion}
        customerLocation={customerLocation}
        deliveryLocation={deliveryLocation}
        routeCoordinates={routeCoordinates}
        userRole={user?.role}
      />

      {/* Info Panel Overlay */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>Tracking Status</Text>
        {user?.role === 'delivery' ? (
          <Text style={styles.infoText}>Broadcasting your location live.</Text>
        ) : deliveryLocation ? (
          <Text style={styles.infoText}>Driver is on the way!</Text>
        ) : (
          <Text style={styles.infoText}>Waiting for driver to connect...</Text>
        )}
        <Text style={styles.address}>
          Destination: {order?.shippingAddress?.street}, {order?.shippingAddress?.city}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  header: { 
    position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)', padding: 15, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
  },
  backButton: { marginBottom: 5 },
  backButtonText: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold' },
  statusId: { fontSize: 14, color: '#666' },
  infoPanel: {
    position: 'absolute', bottom: 30, left: 20, right: 20, zIndex: 10,
    backgroundColor: 'white', padding: 20, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
  },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  infoText: { fontSize: 16, color: '#444', marginBottom: 10 },
  address: { fontSize: 14, color: '#888' },
  driverMarker: { backgroundColor: 'white', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: '#007AFF' }
});
