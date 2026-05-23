import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

interface UseRealtimeGPSOptions {
  token: string;
  rideId?: string;
  onLocationUpdate?: (data: any) => void;
  onStatusChange?: (data: any) => void;
  enabled?: boolean;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

/**
 * Hook para recibir actualizaciones GPS en tiempo real
 * Usado por pasajeros para rastrear el conductor
 */
export const useRealtimeGPS = ({
  token,
  rideId,
  onLocationUpdate,
  onStatusChange,
  enabled = true,
}: UseRealtimeGPSOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [driverLocation, setDriverLocation] = useState<GPSLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect to Socket.io
  useEffect(() => {
    if (!enabled || !token) return;

    try {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('✓ Socket.io connected');
        setIsConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log('✗ Socket.io disconnected');
        setIsConnected(false);
        setIsTracking(false);
      });

      socketRef.current.on('connect_error', (error: Error) => {
        console.error('Connection error:', error);
        setError(error.message);
      });
    } catch (err) {
      console.error('Socket initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [enabled, token]);

  // Connect to GPS namespace and start tracking
  const startTracking = useCallback(async () => {
    if (!socketRef.current || !rideId || !isConnected) return;

    try {
      const gpsSocket = io(`${SOCKET_URL}/gps`, {
        auth: { token },
      });

      gpsSocket.emit('gps:track_request', { rideId });

      gpsSocket.on('gps:track_receive', (data: any) => {
        setIsTracking(true);
        console.log('✓ Tracking started, recent points:', data.recentTrack.length);
      });

      gpsSocket.on('driver:location_update', (data: any) => {
        setDriverLocation(data.location);
        onLocationUpdate?.(data);
      });

      gpsSocket.on('ride:status_update', (data: any) => {
        onStatusChange?.(data);
      });

      gpsSocket.on('error:unauthorized', (data: any) => {
        setError(data.message);
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Tracking failed';
      setError(errorMsg);
    }
  }, [rideId, isConnected, token, onLocationUpdate, onStatusChange]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (!socketRef.current || !rideId) return;

    socketRef.current.emit('gps:track_stop', { rideId });
    setIsTracking(false);
    setDriverLocation(null);
  }, [rideId]);

  return {
    isConnected,
    isTracking,
    driverLocation,
    error,
    startTracking,
    stopTracking,
  };
};

/**
 * Hook para que el conductor envíe actualizaciones GPS
 * Usado por conductores durante el viaje
 */
export const useDriverGPS = ({
  token,
  rideId,
  enabled = true,
}: Omit<UseRealtimeGPSOptions, 'onLocationUpdate' | 'onStatusChange'>) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Initialize connection
  useEffect(() => {
    if (!enabled || !token) return;

    try {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('✓ Driver socket connected');
        setIsConnected(true);
      });

      socketRef.current.on('error', (error: Error) => {
        setError(error.message);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [enabled, token]);

  // Start sending GPS updates
  const startBroadcasting = useCallback(() => {
    if (!navigator.geolocation || !isConnected || !rideId) {
      setError('Geolocation not available');
      return;
    }

    try {
      const gpsSocket = io(`${SOCKET_URL}/gps`, {
        auth: { token },
      });

      // Watch position with high accuracy
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, heading, speed } = position.coords;

          gpsSocket.emit('gps:update', {
            rideId,
            location: {
              latitude,
              longitude,
              accuracy,
              heading,
              speed,
            },
          });
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      console.log('✓ GPS broadcasting started');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Broadcasting failed');
    }
  }, [isConnected, rideId, token]);

  // Stop broadcasting
  const stopBroadcasting = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return {
    isConnected,
    error,
    startBroadcasting,
    stopBroadcasting,
  };
};
