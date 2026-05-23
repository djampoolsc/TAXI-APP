# Real-time GPS with Socket.io

## Overview

Real-time GPS tracking enables:
- **Drivers** to broadcast their live location to passengers
- **Passengers** to track driver location during ride
- **Multi-instance support** via Redis adapter
- **Automatic reconnection** and connection management

## Architecture

```
Driver Mobile ──┐
                ├─→ Socket.io Server (Port 3000/wss)
Passenger Web ──┤   with Redis Adapter
                └─→ Redis Pub/Sub
                    (Multi-instance sync)
```

## Backend Setup

### Installation

Dependencies already added to `package.json`:
```json
{
  "socket.io": "^4.7.2",
  "@socket.io/redis-adapter": "^8.1.0"
}
```

Run: `npm install`

### Configuration

Socket.io is initialized in `apps/backend/src/index.ts`:

```typescript
import { initializeSocketIO } from './services/gps/socketio';

const httpServer = http.createServer(app);
initializeSocketIO(httpServer, db);
```

**Environment Variables:**
```env
# Backend .env
CLIENT_URL=http://localhost:3001,http://localhost:3002
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

## Event Structure

### GPS Namespace: `/gps`

All real-time GPS events use the `/gps` namespace.

#### Driver Events

**Send GPS Update**
```typescript
socket.emit('gps:update', {
  rideId: 'ride-123',
  location: {
    latitude: 12.0456,
    longitude: -77.0289,
    accuracy: 5,          // meters
    heading: 45,          // degrees (0-360)
    speed: 12.5,          // m/s
  }
});

// Server responds with:
socket.on('gps:update_received', {
  success: true,
  timestamp: 1716470400000
});
```

**Broadcast Availability**
```typescript
// When driver comes online
socket.emit('driver:available', {
  driverId: 'driver-123',
  location: { ... }
});

// When driver goes offline
socket.emit('driver:unavailable', {
  driverId: 'driver-123'
});
```

#### Passenger Events

**Request Tracking**
```typescript
socket.emit('gps:track_request', {
  rideId: 'ride-123'
});

// Server sends recent track history
socket.on('gps:track_receive', {
  rideId: 'ride-123',
  recentTrack: [
    { latitude, longitude, accuracy, timestamp },
    // ... up to 50 last points
  ],
  trackingStarted: true,
  timestamp: 1716470400000
});
```

**Receive Live Updates**
```typescript
socket.on('driver:location_update', {
  rideId: 'ride-123',
  driverId: 'driver-123',
  location: {
    latitude: 12.0456,
    longitude: -77.0289,
    accuracy: 5,
    heading: 45,
    speed: 12.5,
    timestamp: 1716470400000
  }
});
```

**Stop Tracking**
```typescript
socket.emit('gps:track_stop', {
  rideId: 'ride-123'
});
```

### Ride Status Events

Both drivers and passengers can receive status updates:

```typescript
socket.on('ride:status_update', {
  rideId: 'ride-123',
  status: 'in_progress',  // or 'accepted', 'completed', 'cancelled'
  driverId: 'driver-123',
  location: { ... },
  timestamp: 1716470400000
});
```

## Client Implementation

### React Web App

Use the `useRealtimeGPS` and `useDriverGPS` hooks:

```typescript
import { useRealtimeGPS, useDriverGPS } from '../hooks/useRealtimeGPS';

// Passenger tracking
const { isTracking, driverLocation, error, startTracking, stopTracking } = useRealtimeGPS({
  token: authToken,
  rideId: 'ride-123',
  onLocationUpdate: (data) => {
    console.log('Driver location:', data.location);
  },
});

// Driver broadcasting
const { isConnected, error, startBroadcasting, stopBroadcasting } = useDriverGPS({
  token: authToken,
  rideId: 'ride-123',
});

// Start/stop
startTracking();   // Passenger
startBroadcasting(); // Driver
```

### Flutter Mobile App

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class GPSService {
  late IO.Socket socket;
  
  void connect(String token, String rideId) {
    socket = IO.io(
      'http://localhost:3000',
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .build(),
    );

    socket.onConnect((_) {
      print('✓ Connected');
      // Join GPS namespace
      final gpsSocket = IO.io(
        'http://localhost:3000/gps',
        IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
      );
    });
  }

  void sendGPS(String rideId, double lat, double lng) {
    socket.emit('gps:update', {
      'rideId': rideId,
      'location': {
        'latitude': lat,
        'longitude': lng,
        'accuracy': 5.0,
        'speed': 12.5,
      }
    });
  }

  void trackDriver(String rideId) {
    socket.emit('gps:track_request', {'rideId': rideId});
    
    socket.on('driver:location_update', (data) {
      print('Driver location: ${data['location']}');
    });
  }
}
```

### JavaScript/Web

```javascript
import { io } from 'socket.io-client';

// Connect
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token' },
  transports: ['websocket'],
});

// Passenger: Track driver
socket.emit('gps:track_request', { rideId: 'ride-123' });

socket.on('driver:location_update', (data) => {
  console.log('Driver location:', data.location);
  // Update map
});

// Driver: Send GPS
navigator.geolocation.watchPosition((position) => {
  socket.emit('gps:update', {
    rideId: 'ride-123',
    location: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    },
  });
});
```

## Authentication

Socket.io uses JWT tokens for authentication:

1. Client connects with token in handshake:
```typescript
const socket = io('http://localhost:3000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIs...' },
});
```

2. Server validates token in `socketAuthMiddleware` (`src/middleware/socketAuth.ts`)

3. Token must be valid JWT with `id` and `user_type` claims

**Error responses:**
```typescript
socket.on('auth_error', (error) => {
  console.error('Authentication failed:', error);
});

socket.on('error:unauthorized', { message: 'No access to ride' });
```

## Redis Data Storage

GPS locations are stored in Redis for:
- Real-time access
- Multi-instance sync
- Historical track retrieval

**Redis Keys:**
```
gps:ride-123 → [list of 1000 GPS points]
               (newest first, auto-expires in 24h)
```

**TTL:** 24 hours (86400 seconds)

**Retention:** Last 1000 points per ride (~100 minutes at 10s intervals)

### Retrieve GPS History

```typescript
// HTTP API
GET /api/v1/telemetry/ride/:ride_id

// Response
{
  "ride_id": "ride-123",
  "track_points": 847,
  "track": [
    { "latitude": 12.045, "longitude": -77.028, "timestamp": 1716470400000 },
    { "latitude": 12.046, "longitude": -77.029, "timestamp": 1716470410000 },
    // ... more points
  ]
}
```

## Performance Considerations

### Broadcasting Scale
- **Max concurrent connections:** 10,000+ (with load balancing)
- **GPS update frequency:** 1-10 seconds (configurable per client)
- **Latency:** <100ms average

### Optimization Tips

1. **GPS Update Interval:** Don't send more than every second
```typescript
// Bad: Too frequent
navigator.geolocation.watchPosition(cb, null, { timeout: 100 });

// Good: 5 second updates
setInterval(() => {
  socket.emit('gps:update', location);
}, 5000);
```

2. **Only track active rides:**
```typescript
// Stop tracking when ride completes
socket.emit('gps:track_stop', { rideId });
```

3. **Use Redis adapter for multi-instance:**
- Automatic Pub/Sub sync between servers
- Horizontal scaling without issues

## Troubleshooting

### Connection Issues

**Problem:** "Connection token required"
```
// Solution: Add auth token to handshake
const socket = io(url, {
  auth: { token: jwtToken }
});
```

**Problem:** CORS errors
```
// Solution: Update CORS in backend
cors: {
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}
```

**Problem:** Frequent disconnections
```
// Solution: Configure reconnection
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

### Performance Issues

**Problem:** High CPU/memory usage
```
// Solution: Limit GPS update frequency
if (Date.now() - lastUpdate > 5000) {
  socket.emit('gps:update', location);
  lastUpdate = Date.now();
}
```

**Problem:** Missed location updates
```
// Solution: Use Redis for sync
// Already implemented with @socket.io/redis-adapter
```

## Testing

### Unit Tests

```typescript
// Test GPS event emission
describe('GPS Events', () => {
  it('should broadcast driver location to passengers', async () => {
    const driverSocket = io(url, { auth: { token: driverToken } });
    const passengerSocket = io(url, { auth: { token: passengerToken } });

    passengerSocket.emit('gps:track_request', { rideId: 'ride-123' });
    
    await new Promise(resolve => {
      passengerSocket.on('driver:location_update', resolve);
      driverSocket.emit('gps:update', {
        rideId: 'ride-123',
        location: { latitude: 12.0, longitude: -77.0 }
      });
    });
  });
});
```

### Load Testing

```bash
# Test with 100 concurrent drivers
artillery run load-test.yml

# Test GPS broadcast latency
npm run test:gps-latency
```

## Next Steps

1. Integrate Mapbox/Google Maps for visual tracking
2. Add WebSocket fallback for low-bandwidth
3. Implement route optimization with GPS data
4. Add geofencing for automatic ride completion
5. Create analytics dashboard for GPS metrics

## References

- [Socket.io Documentation](https://socket.io/docs/)
- [Socket.io Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [PostGIS for spatial queries](https://postgis.net/)
