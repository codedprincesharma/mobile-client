import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface MapComponentProps {
  customerLocation?: { latitude: number; longitude: number } | null;
  deliveryLocation?: { latitude: number; longitude: number } | null;
  routeCoordinates?: { latitude: number; longitude: number }[];
  userRole?: string;
  style?: any;
  initialRegion?: any;
}

const MapComponent = forwardRef<any, MapComponentProps>(({ style }, ref) => {
  return (
    <View style={[style, styles.placeholder]} ref={ref}>
      <Text style={styles.text}>📍 Map Preview Not Available on Web</Text>
      <Text style={styles.subtext}>Live tracking maps are currently optimized for mobile devices.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default MapComponent;
