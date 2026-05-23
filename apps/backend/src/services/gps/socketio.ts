import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisClient } from '../../config/redis';
import { socketAuthMiddleware, verifyRideAccess, isDriver, isPassenger } from '../../middleware/socketAuth';
import {
  SocketEvents,
  GPSUpdatePayload,
  PassengerTrackingPayload,
  RideStatusUpdate,
} from '../../types/socket';

let io: SocketIOServer;

/**
 * Initialize Socket.io server
 */
export const initializeSocketIO = (httpServer: HTTPServer, db: any) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || ['http://localhost:3001', 'http://localhost:3002'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Use Redis adapter for multi-instance support
  const pubClient = redisClient.duplicate();
  io.adapter(createAdapter(redisClient, pubClient));

  // Authentication middleware
  io.use(socketAuthMiddleware);

  // GPS namespace
  setupGPSNamespace(io, db);

  // Connection handlers
  io.on('connect', (socket) => {
    console.log(`→ Client connected: ${socket.id} (User: ${socket.data?.userId})`);

    socket.on('disconnect', () => {
      console.log(`← Client disconnected: ${socket.id}`);
      // Clean up active rides when driver disconnects
      if (isDriver(socket)) {
        io.to(`driver:${socket.data?.userId}`).emit(SocketEvents.DRIVER_UNAVAILABLE, {
          driverId: socket.data?.userId,
          timestamp: Date.now(),
        });
      }
    });

    socket.on('error', (error) => {
      console.error(`Socket error [${socket.id}]:`, error);
    });
  });

  console.log('✓ Socket.io initialized');
  return io;
};

/**
 * GPS Namespace Handler
 * Handles all GPS tracking and real-time location updates
 */
function setupGPSNamespace(io: SocketIOServer, db: any) {
  const gpsNamespace = io.of('/gps');

  gpsNamespace.on('connect', (socket: Socket) => {
    console.log(`→ GPS namespace connected: ${socket.id}`);

    /**
     * EVENT: Driver sends GPS update
     * Payload: { rideId, location: { latitude, longitude, accuracy, heading, speed } }
     */
    socket.on(SocketEvents.GPS_UPDATE, async (payload: any) => {
      try {
        const { rideId, location } = payload;
        const driverId = socket.data?.userId;

        if (!rideId || !location) {
          socket.emit(SocketEvents.ERROR, { message: 'Missing required fields' });
          return;
        }

        if (!isDriver(socket)) {
          socket.emit(SocketEvents.ERROR_UNAUTHORIZED, { message: 'Only drivers can send GPS' });
          return;
        }

        // Verify driver has access to this ride
        const hasAccess = await verifyRideAccess(socket, rideId, db);
        if (!hasAccess) {
          socket.emit(SocketEvents.ERROR_UNAUTHORIZED, { message: 'No access to ride' });
          return;
        }

        const gpsData: GPSUpdatePayload = {
          rideId,
          driverId: driverId!,
          location: {
            ...location,
            timestamp: Date.now(),
          },
        };

        // Store in Redis for history
        const gpsKey = `gps:${rideId}`;
        await redisClient.lPush(gpsKey, JSON.stringify(gpsData));
        await redisClient.lTrim(gpsKey, 0, 999); // Keep last 1000 points
        await redisClient.expire(gpsKey, 86400); // 24 hour expiration

        // Broadcast to passengers watching this ride
        gpsNamespace.to(`ride:${rideId}:passengers`).emit(SocketEvents.DRIVER_LOCATION_UPDATE, gpsData);

        // Emit success confirmation
        socket.emit('gps:update_received', { success: true, timestamp: Date.now() });
      } catch (err) {
        console.error('GPS update error:', err);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to process GPS update' });
      }
    });

    /**
     * EVENT: Passenger requests to track driver
     * Payload: { rideId }
     * Client joins room and starts receiving GPS updates
     */
    socket.on(SocketEvents.GPS_TRACK_REQUEST, async (payload: any) => {
      try {
        const { rideId } = payload;
        const passengerId = socket.data?.userId;

        if (!rideId) {
          socket.emit(SocketEvents.ERROR, { message: 'Missing rideId' });
          return;
        }

        if (!isPassenger(socket)) {
          socket.emit(SocketEvents.ERROR_UNAUTHORIZED, { message: 'Only passengers can track' });
          return;
        }

        // Verify passenger has access to this ride
        const hasAccess = await verifyRideAccess(socket, rideId, db);
        if (!hasAccess) {
          socket.emit(SocketEvents.ERROR_UNAUTHORIZED, { message: 'No access to ride' });
          return;
        }

        // Join tracking room
        socket.join(`ride:${rideId}:passengers`);

        // Send recent GPS history to passenger
        const gpsKey = `gps:${rideId}`;
        const gpsHistory = await redisClient.lRange(gpsKey, 0, 49); // Last 50 points
        const track = gpsHistory.map((point) => JSON.parse(point)).reverse();

        socket.emit(SocketEvents.GPS_TRACK_RECEIVE, {
          rideId,
          recentTrack: track,
          trackingStarted: true,
          timestamp: Date.now(),
        });

        console.log(`✓ Passenger ${passengerId} tracking ride ${rideId}`);
      } catch (err) {
        console.error('GPS track request error:', err);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to start tracking' });
      }
    });

    /**
     * EVENT: Passenger stops tracking
     */
    socket.on(SocketEvents.GPS_TRACK_STOP, (payload: any) => {
      try {
        const { rideId } = payload;
        socket.leave(`ride:${rideId}:passengers`);
        console.log(`✓ Passenger ${socket.data?.userId} stopped tracking ride ${rideId}`);
      } catch (err) {
        console.error('GPS track stop error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`← GPS namespace disconnected: ${socket.id}`);
    });
  });
}

/**
 * Broadcast ride status update to all participants
 */
export const broadcastRideUpdate = (rideUpdate: RideStatusUpdate) => {
  if (!io) return;

  const { rideId, status, driverId } = rideUpdate;
  io.of('/gps').to(`ride:${rideId}`).emit(SocketEvents.RIDE_STATUS_UPDATE, rideUpdate);

  console.log(`✓ Broadcasted ride ${rideId} status: ${status}`);
};

/**
 * Notify driver is available (online and ready)
 */
export const broadcastDriverAvailable = (driverId: string, location?: any) => {
  if (!io) return;

  io.of('/gps')
    .to(`driver:${driverId}`)
    .emit(SocketEvents.DRIVER_AVAILABLE, {
      driverId,
      location,
      timestamp: Date.now(),
    });
};

/**
 * Get active GPS connections for a ride
 */
export const getActiveRideConnections = async (rideId: string): Promise<string[]> => {
  if (!io) return [];
  const room = io.of('/gps').adapter.rooms.get(`ride:${rideId}:passengers`);
  return room ? Array.from(room) : [];
};

/**
 * Get Socket.io server instance
 */
export const getSocketIOServer = (): SocketIOServer => {
  return io;
};
