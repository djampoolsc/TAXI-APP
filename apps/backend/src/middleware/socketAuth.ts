import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { SocketAuthData, SocketEvents } from '../types/socket';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Socket.io authentication middleware
 * Verifies JWT token from socket handshake query
 */
export const socketAuthMiddleware = (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.id || !decoded.user_type) {
      return next(new Error('Invalid token payload'));
    }

    // Attach auth data to socket
    socket.data = {
      userId: decoded.id,
      userType: decoded.user_type,
      rideId: socket.handshake.query.rideId,
      socketId: socket.id,
      connectedAt: new Date(),
    };

    console.log(`✓ Socket authenticated: ${socket.id} (User: ${decoded.id})`);
    next();
  } catch (err: any) {
    console.error('Socket authentication failed:', err.message);
    next(new Error(`Authentication failed: ${err.message}`));
  }
};

/**
 * Verify ride ownership - ensures user can access ride data
 */
export const verifyRideAccess = async (
  socket: Socket,
  rideId: string,
  db: any
): Promise<boolean> => {
  try {
    const userId = socket.data?.userId;
    if (!userId) return false;

    // Query database to verify user is part of this ride
    const result = await db.query(
      'SELECT passenger_id, driver_id FROM rides WHERE id = $1',
      [rideId]
    );

    if (!result.rows.length) return false;

    const { passenger_id, driver_id } = result.rows[0];
    return userId === passenger_id || userId === driver_id;
  } catch (err) {
    console.error('Ride access verification failed:', err);
    return false;
  }
};

/**
 * Verify user is driver
 */
export const isDriver = (socket: Socket): boolean => {
  return socket.data?.userType === 'driver';
};

/**
 * Verify user is passenger
 */
export const isPassenger = (socket: Socket): boolean => {
  return socket.data?.userType === 'passenger';
};
