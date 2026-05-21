# Architecture - Axiom Perú

## Overview

Axiom Perú es una plataforma de movilidad con **arquitectura dual** para soportar Metrópolis (Lima/Callao) y Regiones (Provincias) con diferentes requisitos técnicos:
- **Metrópolis:** Online-first, real-time, alta concurrencia
- **Regiones:** Offline-first, sincronización, baja conectividad

## Technology Stack

### Frontend
| Layer | Technology | Why |
|-------|-----------|-----|
| Mobile | Flutter 3.x | Single codebase iOS+Android, performance, offline support |
| Web PWA | React 18 + TypeScript | Progressive enhancement, Service Workers, Vite |
| Admin | Next.js 14 + Tailwind | SSR, API routes, rapid dashboard development |

### Backend
| Component | Technology | Why |
|-----------|-----------|-----|
| API Gateway | Kong/Nginx | Load balancing, rate limiting, request routing |
| Services | Node.js 20 + Express | Event-driven, non-blocking I/O, ecosystem |
| Real-time | Socket.io / GraphQL | WebSockets para GPS en tiempo real |
| Type Safety | TypeScript | Catch errors at compile-time |

### Data Layer
| Database | Purpose | Why |
|----------|---------|-----|
| PostgreSQL + PostGIS | Transactional + Geospatial | ACID guarantees, native geo queries |
| Redis 7 | Cache + Pub/Sub + Sessions | Sub-millisecond latency, pattern matching |
| MongoDB | Logs + Events | Flexible schema, time-series data |
| CouchDB | Sync Server | Conflict resolution, offline-first design |

### ML & Intelligence
| Component | Tech | Purpose |
|-----------|------|---------|
| On-Device | TensorFlow Lite | Audio analysis (panic button), liveness detection |
| Backend ML | Python 3.11 + TensorFlow | Fraud detection, demand prediction |
| Model Management | MLflow | Versioning, experiment tracking |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| Compute | AWS EC2 (São Paulo) | Primary region: sa-east-1 |
| Storage | AWS S3 | Documents, audio, logs |
| CDN | Cloudflare | Image optimization, DDoS protection |
| Observability | Datadog | APM, logs, traces, metrics |
| Errors | Sentry | Real-time error tracking |
| Push | Firebase | iOS + Android notifications |

## System Architecture

### High-Level Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
├─────────────────────────────────────────────────────────┤
│  iOS App    │  Android App    │  React Web    │  Admin  │
│  (Flutter)  │  (Flutter)      │  (PWA)        │ (Next)  │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│              Cloudflare (WAF + CDN)                      │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│           API Gateway (Kong / Nginx)                     │
│       - Rate limiting, authentication, routing           │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│              Microservices (Node.js)                     │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  Auth    │ Matching │ Routing  │ Payments │ Telemetry   │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ Fraud    │ Notif.   │ Sync     │   ML     │  Emergency  │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│            Data & Cache Layer                            │
├──────────┬──────────┬──────────┬──────────────────────────┤
│PostgreSQL│  Redis   │ MongoDB  │      CouchDB             │
│+PostGIS  │  Cache   │ Logs     │  (Sync Server)           │
└──────────┴──────────┴──────────┴──────────────────────────┘
```

## Microservices

### Auth Service
**Responsabilidad:** Autenticación, MFA, KYC validation
- Endpoints: `/auth/register`, `/auth/login`, `/auth/mfa`
- Integración: Auth0 + local MFA (device fingerprint, behavioral biometrics)
- Rate limiting: 5 intentos/min (brute force protection)

### Matching Service
**Responsabilidad:** Pairing passenger-driver, proximity-based matching
- Algoritmo: Proximidad + reputación + disponibilidad
- Tiempo: <10 segundos match
- Cache: Redis geospatial (GEOHASH)

### Routing Service
**Responsabilidad:** Cálculo de rutas, ETA, tarifa
- SmartRoutingEngine: Google Maps + Waze + histórico + clima
- 3 rutas alternativas, recálculo cada 3 min
- Tarifa transparente (desglose: base + km + min + multiplicador)

### Payments Service
**Responsabilidad:** Procesamiento de pagos, billetera
- Integraciones: Yape, Plin, Stripe, SMS fallback
- Billetera Axiom: saldo local en PostgreSQL
- Cambio Digital: crédito automático por falta de cambio

### Telemetry Service
**Responsabilidad:** GPS tracking, eventos, analytics
- GPS: cada 10s en viaje activo (local + cloud)
- Eventos: trip_start, trip_end, rating, feedback
- Almacenamiento: TimescaleDB (optimizado para series temporales)

### Fraud Service
**Responsabilidad:** Detección de fraude en tiempo real
- Scoring: ML + reglas (score 0-1)
- Triggers: múltiples cuentas/device, KYC mismatch, pattern anomalies
- Acciones: bloqueo, review manual, MFA revalidación

### Sync Service
**Responsabilidad:** Sincronización offline-first para regiones
- Protocol: CouchDB replication
- Bidireccional: cliente ↔ servidor
- Reconciliación: last-write-wins + conflict resolution

## Data Models (Minimal)

### Users (PostgreSQL)
```sql
- id (UUID)
- document_id
- phone
- email
- profile_type (passenger | driver)
- kyc_status (pending | verified | rejected)
- reputation_score
- created_at, updated_at
```

### Rides (PostgreSQL)
```sql
- id (UUID)
- passenger_id, driver_id
- origin, destination (Point - PostGIS)
- status (requested | accepted | in_progress | completed | cancelled)
- fare_amount, payment_method
- started_at, ended_at
```

### GPS Tracks (TimescaleDB hypertable)
```sql
- ride_id
- user_id
- location (Point)
- timestamp
- accuracy
```

### Wallets (PostgreSQL)
```sql
- user_id
- balance
- currency (PEN)
- last_transaction_id, updated_at
```

## Offline-First (Regiones)

### Client (PouchDB)
```
Local Database (SQLite/PouchDB)
├── Users (local copy)
├── Rides (draft + synced)
├── GPS Tracks (buffer)
└── Wallet State
```

### Sync Flow
1. **Offline:** App stores in PouchDB local DB
2. **Reconnect:** Detect network → initiate sync
3. **Bidirectional:** Push local changes + pull server updates
4. **Conflict Resolution:** Last-write-wins for most docs, manual for critical (payments)
5. **Retry:** Exponential backoff

### SMS Fallback
- Driver sends: `AXM START <CODE>` → SMS → Backend
- Backend processes as API call
- Response: SMS con confirmación y tarifa

## Security Architecture

### Authentication
- **Primary:** Auth0 + JWT
- **MFA Adaptive:**
  - Facial recognition (liveness check)
  - Device fingerprinting (hwid, OS, app version)
  - Behavioral biometrics (location, app patterns)
  - Context-aware (time, location consistency)

### Data Protection
- **Transport:** TLS 1.3 everywhere
- **At Rest:** AES-256 for sensitive fields (documents, payment tokens)
- **Secrets:** HashiCorp Vault
- **Compliance:** Ley 29733 (Personal data protection)

### Fraud Prevention
- **Real-time Scoring:** ML + rules engine
- **Blocklists:** Device, phone, email, bank account
- **Circuit Breaker:** Auto-block suspicious accounts
- **Audit Trail:** Immutable logs for compliance

### Privacy
- On-device processing: Audio analysis local (no upload)
- Data minimization: Collect only necessary fields
- Escolta digital: Doble consentimiento, encriptado end-to-end
- GDPR-ready: Data export, deletion endpoints

## Deployment & CI/CD

### Local Development
```bash
pnpm docker:up          # PostgreSQL, Redis, MongoDB, CouchDB
pnpm install            # Dependencies
pnpm dev                # All services
```

### CI/CD Pipeline (GitHub Actions)
```
PR → lint/test/build → ✅ Staging
main → build images → push Docker Hub → deploy staging
tag release → deploy production
```

### Container Orchestration (Future)
- Kubernetes for scaling
- Helm charts for configuration
- HPA (Horizontal Pod Autoscaling) based on CPU/memory

## Monitoring & Observability

### Metrics (Prometheus)
- API latency, error rates
- Database query performance
- Worker queue depths
- ML model accuracy

### Logs (ELK Stack)
- Structured logging (JSON)
- Log levels: INFO, WARN, ERROR, DEBUG
- Correlation IDs for request tracing

### Tracing (Datadog APM)
- Request path through microservices
- Database query insights
- Memory leaks, CPU profiling

### Alerts
- P99 latency > 1s
- Error rate > 1%
- Database connection pool exhausted
- OOM events

## API Versioning

- **URL-based:** `/api/v1/`, `/api/v2/`
- **Backward compatibility:** At least 2 major versions
- **Deprecation:** 3-month notice period

## Testing Strategy

| Layer | Type | Coverage | Tool |
|-------|------|----------|------|
| Unit | Functions, utilities | 80%+ | Jest |
| Integration | API + Database | 70%+ | Jest + testcontainers |
| E2E | Full user flows | Key paths | Cypress |
| Performance | Load testing | Critical APIs | k6 |
| Security | SAST, DAST | Per sprint | SonarQube, OWASP ZAP |

## Scalability Considerations

### Current (MVP)
- Single region (São Paulo)
- Monolith backend initially
- PostgreSQL primary + read replicas
- Redis cluster for cache

### Future (Post-MVP)
- Multi-region (Perú + otros países)
- Microservices decomposition
- Sharding by geography
- Event streaming (Kafka)
- CQRS pattern for read-heavy queries

## Decision Log

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-01 | Flutter para mobile | Single codebase, performance, community |
| 2026-01 | PostgreSQL + PostGIS | Geo queries, ACID, ecosystem |
| 2026-01 | Node.js backend | Event-driven, non-blocking, team expertise |
| 2026-01 | Monorepo (pnpm) | Shared types, coordinated releases |
| 2026-01 | CouchDB para sync | Offline-first, conflict resolution |

## References

- SETUP.md - Guía de instalación
- CONTRIBUTING.md - Workflow de desarrollo
- API_SPEC.md - Especificación de APIs (TODO)
