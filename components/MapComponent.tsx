import React, { forwardRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';

export interface MapComponentProps extends MapViewProps {
  customerLocation?: { latitude: number; longitude: number } | null;
  deliveryLocation?: { latitude: number; longitude: number } | null;
  routeCoordinates?: { latitude: number; longitude: number }[];
  userRole?: string;
}

const MapComponent = forwardRef<MapView, MapComponentProps>(({ 
  customerLocation, 
  deliveryLocation, 
  routeCoordinates, 
  userRole,
  ...props 
}, ref) => {
  return (
    <MapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      {...props}
    >
      {customerLocation && (
        <Marker 
          coordinate={customerLocation}
          title="Delivery Destination"
          description="Drop off here"
          pinColor="green"
        />
      )}

      {deliveryLocation && (
        <Marker 
          coordinate={deliveryLocation}
          title="Delivery Driver"
          description={userRole === 'delivery' ? 'You are here' : 'Driver is here'}
        />
      )}

      {routeCoordinates && routeCoordinates.length > 1 && (
        <Polyline 
          coordinates={routeCoordinates}
          strokeColor="#007AFF"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
});

export default MapComponent;
