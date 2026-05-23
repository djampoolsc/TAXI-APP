import React, { useEffect, useState } from 'react';
import { useRealtimeGPS, useDriverGPS } from '../hooks/useRealtimeGPS';
import { useRideStore } from '../store';

interface LiveMapProps {
  rideId: string;
  userType: 'driver' | 'passenger';
  token: string;
}

interface MapMarker {
  latitude: number;
  longitude: number;
  accuracy?: number;
  type: 'driver' | 'passenger' | 'destination';
  label: string;
}

/**
 * Componente de mapa en vivo para rastrear conductor/pasajero
 * Nota: Requiere integración con mapbox o google maps
 */
export const LiveMap: React.FC<LiveMapProps> = ({ rideId, userType, token }) => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [route, setRoute] = useState<any[]>([]);
  const ride = useRideStore((state) => state.activeRide);

  // Passenger tracking
  const passenger = useRealtimeGPS({
    token,
    rideId,
    enabled: userType === 'passenger',
    onLocationUpdate: (data) => {
      // Update driver location marker
      setMarkers((prev) => [
        ...prev.filter((m) => m.type !== 'driver'),
        {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          accuracy: data.location.accuracy,
          type: 'driver',
          label: 'Driver',
        },
      ]);

      // Add to route history
      setRoute((prev) => [...prev, data.location]);
    },
    onStatusChange: (data) => {
      console.log('Ride status changed:', data.status);
    },
  });

  // Driver broadcasting
  const driver = useDriverGPS({
    token,
    rideId,
    enabled: userType === 'driver',
  });

  // Initialize map markers
  useEffect(() => {
    const initialMarkers: MapMarker[] = [];

    if (ride?.origin) {
      initialMarkers.push({
        latitude: ride.origin.latitude,
        longitude: ride.origin.longitude,
        type: 'passenger',
        label: 'Pickup',
      });
    }

    if (ride?.destination) {
      initialMarkers.push({
        latitude: ride.destination.latitude,
        longitude: ride.destination.longitude,
        type: 'destination',
        label: 'Destination',
      });
    }

    setMarkers(initialMarkers);
  }, [ride]);

  // Start tracking when component mounts
  useEffect(() => {
    if (userType === 'passenger' && passenger.isConnected) {
      passenger.startTracking();
    }

    if (userType === 'driver' && driver.isConnected) {
      driver.startBroadcasting();
    }

    return () => {
      if (userType === 'passenger') {
        passenger.stopTracking();
      } else {
        driver.stopBroadcasting();
      }
    };
  }, [userType, passenger.isConnected, driver.isConnected]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div id="map-container" className="w-full h-full relative bg-slate-800">
        {/* Placeholder: Replace with Mapbox/Google Maps */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-300 mb-2">Map Integration Required</p>
            <p className="text-slate-500 text-sm">
              Markers: {markers.length} | Route points: {route.length}
            </p>
          </div>
        </div>

        {/* Status Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur rounded-lg p-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${passenger.isConnected || driver.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-slate-300">
                {passenger.isTracking || driver.isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {passenger.driverLocation && (
              <div className="text-slate-400">
                <p className="text-xs">Accuracy: {passenger.driverLocation.accuracy?.toFixed(0)}m</p>
                <p className="text-xs">Speed: {(passenger.driverLocation.speed || 0).toFixed(1)} m/s</p>
              </div>
            )}

            {passenger.error && (
              <p className="text-red-400 text-xs">{passenger.error}</p>
            )}

            {driver.error && (
              <p className="text-red-400 text-xs">{driver.error}</p>
            )}
          </div>
        </div>

        {/* Markers List (Debug) */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur rounded-lg p-3 max-w-xs">
          <div className="space-y-1">
            {markers.map((marker, idx) => (
              <div key={idx} className="text-xs text-slate-400">
                <span className="font-semibold">{marker.label}:</span>{' '}
                <span>
                  {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Ejemplo de uso:
 *
 * <LiveMap
 *   rideId="ride-123"
 *   userType="passenger"
 *   token={authToken}
 * />
 */
