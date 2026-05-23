// Socket.io Event Types
import { Socket as SocketClient } from 'socket.io';

export interface SocketAuthData {
  userId: string;
  userType: 'driver' | 'passenger';
  rideId?: string;
}

export interface SocketData extends SocketAuthData {
  socketId: string;
  connectedAt: Date;
}

// GPS tracking events
export interface GPSLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GPSUpdatePayload {
  rideId: string;
  driverId: string;
  location: GPSLocationData;
}

export interface PassengerTrackingPayload {
  rideId: string;
  driverLocation: GPSLocationData;
  timestamp: number;
}

// Ride status events
export interface RideStatusUpdate {
  rideId: string;
  status: 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  location?: GPSLocationData;
  timestamp: number;
}

// Socket.io Server type
export type SocketIOServer = any; // socket.io Server type

// Socket event names
export enum SocketEvents {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  AUTH_ERROR = 'auth_error',

  // GPS tracking
  GPS_UPDATE = 'gps:update',
  GPS_TRACK_REQUEST = 'gps:track_request',
  GPS_TRACK_RECEIVE = 'gps:track_receive',
  GPS_TRACK_STOP = 'gps:track_stop',

  // Ride status
  RIDE_STATUS_UPDATE = 'ride:status_update',
  RIDE_ACCEPT = 'ride:accept',
  RIDE_START = 'ride:start',
  RIDE_COMPLETE = 'ride:complete',

  // Driver location broadcast
  DRIVER_LOCATION_UPDATE = 'driver:location_update',
  DRIVER_AVAILABLE = 'driver:available',
  DRIVER_UNAVAILABLE = 'driver:unavailable',

  // Errors
  ERROR = 'error',
  ERROR_INVALID_TOKEN = 'error:invalid_token',
  ERROR_UNAUTHORIZED = 'error:unauthorized',
}

// Socket client extended interface
export interface SocketWithAuth extends SocketClient {
  auth?: SocketAuthData;
  data: SocketData;
}
