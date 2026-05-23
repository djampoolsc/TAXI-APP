# Real-time GPS - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies

```bash
cd apps/backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

Key settings for Socket.io:
```env
CLIENT_URL=http://localhost:3001,http://localhost:3002
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-min-32-chars
```

### 3. Start Backend with WebSocket

```bash
# Terminal 1: Backend API + Socket.io
cd apps/backend
npm run dev

# You should see:
# ✓ Socket.io initialized
# WebSocket: ws://localhost:3000
```

### 4. Test Connection

```bash
# Terminal 2: Run E2E tests
cd apps/backend
npm run test:gps-e2e

# Expected output:
# ✓ 1. Driver authentication
# ✓ 2. Passenger authentication
# ✓ 3. GPS namespace connection
# ✓ 4. GPS update broadcast
# ✓ 5. GPS tracking request
# ✓ 6. Invalid token rejection
```

---

## 🎯 Quick Integration

### React Web - Display Live Driver Location

```tsx
import { useRealtimeGPS } from './hooks/useRealtimeGPS';
import { LiveMap } from './components/LiveMap';

function RideTracking() {
  const { authToken } = useAuth();
  const { rideId } = useParams();

  return (
    <LiveMap
      rideId={rideId}
      userType="passenger"
      token={authToken}
    />
  );
}
```

### Flutter Mobile - Send GPS Updates

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class DriverService {
  void startGPSBroadcast(String rideId, String token) {
    final socket = IO.io(
      'http://localhost:3000/gps',
      IO.OptionBuilder()
        .setAuth({'token': token})
        .setTransports(['websocket'])
        .build(),
    );

    // Send GPS every 5 seconds
    Timer.periodic(Duration(seconds: 5), (_) {
      final position = await Geolocator.getCurrentPosition();
      socket.emit('gps:update', {
        'rideId': rideId,
        'location': {
          'latitude': position.latitude,
          'longitude': position.longitude,
          'accuracy': position.accuracy,
        }
      });
    });
  }
}
```

---

## 🔍 Test in Browser Console

```javascript
// Open browser console on http://localhost:3001

// 1. Get auth token
const token = localStorage.getItem('axiom_auth_token');

// 2. Connect to Socket.io
const socket = io('http://localhost:3000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('✓ Connected:', socket.id);
});

// 3. Start GPS tracking as passenger
const gpsSocket = io('http://localhost:3000/gps', {
  auth: { token }
});

gpsSocket.emit('gps:track_request', { 
  rideId: 'ride-123' 
});

// 4. Listen for driver location
gpsSocket.on('driver:location_update', (data) => {
  console.log('Driver location:', data.location);
  // Update map here
});

// 5. Simulate driver sending GPS (in another window as driver)
gpsSocket.emit('gps:update', {
  rideId: 'ride-123',
  location: {
    latitude: 12.0456,
    longitude: -77.0289,
    accuracy: 5,
    speed: 12.5
  }
});
```

---

## 📊 Monitor Live Connections

```bash
# Check Redis connections
redis-cli
> INFO clients
> KEYS "gps:*"

# Monitor Socket.io activity
tail -f logs/socket.log | grep "GPS"
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection token required" | Add `auth: { token }` to socket connection |
| CORS errors | Update `CLIENT_URL` in .env with correct origins |
| GPS not updating | Check GPS accuracy setting and update interval (5-10s recommended) |
| WebSocket disconnects | Enable auto-reconnect in client config |

---

## 📱 Next Features to Add

- [ ] Mapbox integration for map display
- [ ] Geofencing for auto-completion
- [ ] Route optimization using GPS track
- [ ] Driver ETA calculation
- [ ] Offline mode with PouchDB sync

---

## 📚 Full Documentation

See [REALTIME_GPS.md](./REALTIME_GPS.md) for:
- Complete event structure
- All socket event types
- Redis data storage
- Performance optimization
- Load testing guide
