# MVP Deployment Guide

## Quick Start

### 1. Backend Setup
```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Start backend
npm run dev
# Runs on http://localhost:3000
```

### 2. Web App Setup
```bash
cd apps/web
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Mobile App Setup
```bash
cd apps/mobile
flutter pub get
flutter run
# Choose device/emulator
```

### 4. Admin Dashboard Setup
```bash
cd apps/admin
npm install
npm run dev
# Runs on http://localhost:3002
```

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/axiom_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-min-32-chars
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

**Web (.env)**
```
REACT_APP_API_URL=http://localhost:3000/api/v1
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Rides
- `POST /api/v1/rides/request` - Request a ride
- `POST /api/v1/rides/:id/accept` - Driver accepts ride
- `POST /api/v1/rides/:id/start` - Start ride
- `POST /api/v1/rides/:id/complete` - Complete ride
- `GET /api/v1/rides/active/list` - Get active rides

### Payments (MOCKED for MVP)
- `POST /api/v1/payments/process` - Process payment
- `GET /api/v1/payments/:id` - Get payment details

### Telemetry
- `POST /api/v1/telemetry/gps` - Send GPS location
- `GET /api/v1/telemetry/ride/:ride_id` - Get GPS track

### Emergency
- `POST /api/v1/emergency/panic` - Trigger panic button
- `GET /api/v1/emergency/incidents` - List incidents (admin)

## Testing

### Backend Tests
```bash
npm test
```

### Web Tests (Placeholder)
```bash
cd apps/web
npm test
```

## Database Initialization

The schema is automatically applied when you run:
```bash
npm run db:init
```

This creates all tables with PostGIS support for geospatial queries.

## Docker Deployment (Optional)

```bash
# Build all images
docker-compose -f infra/docker-compose.yml build

# Run stack
docker-compose -f infra/docker-compose.yml up -d

# View logs
docker-compose -f infra/docker-compose.yml logs -f
```

## Performance Tips

1. **GPS Tracking:** Stored in Redis with 24-hour TTL
2. **Caching:** User sessions cached in Redis
3. **Geospatial:** PostGIS indexes on ride origins/destinations
4. **Real-time:** WebSocket integration ready (not in MVP)

## Known Limitations (MVP)

1. Payments are MOCKED (no real Yape/Plin integration)
2. No offline-first sync (Sprint 6)
3. ML models placeholder only
4. Mobile app is Flutter scaffold
5. Admin dashboard is basic

## Next Steps (Post-MVP)

1. Payment gateway integration (Yape, Plin, Stripe)
2. Real-time WebSocket updates
3. ML model deployment (fraud detection, demand prediction)
4. Offline-first with PouchDB sync
5. Mobile app full UI/UX
6. Multi-region deployment
7. Kubernetes orchestration

## Support

- Backend API docs: http://localhost:3000/api/v1/docs (Swagger coming soon)
- Issues: GitHub Issues
- Questions: dev@axiom.pe
