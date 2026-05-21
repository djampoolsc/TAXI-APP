# Axiom Perú 🚗

**Plataforma de Movilidad Inteligente para Perú**

Axiom Perú es una plataforma tecnológica que redefine el transporte urbano y provincial mediante una arquitectura dual adaptada a las realidades diferenciadas del país. Transparencia tarifaria absoluta + tecnología offline-first.

## 📚 Características Clave

- **Dual Architecture**: Axiom Metrópolis (Lima/Callao) + Axiom Regiones (Provincias)
- **Offline-First**: Sincronización bidireccional con PouchDB/CouchDB
- **Smart Routing**: Machine Learning para optimización de rutas en tiempo real
- **Seguridad Avanzada**: Botón de pánico, escolta digital, detección de fraude
- **Transparencia**: Desglose completo de tarifas antes de confirmar viaje
- **Pagos Múltiples**: Yape, Plin, Tarjetas, Billetera Axiom, SMS fallback
- **Formalización Progresiva**: Axiom Aliado para conductores

## 🛠️ Stack Tecnológico

**Frontend:**
- Flutter 3.x (iOS + Android)
- React + TypeScript (PWA)
- Next.js 14 (Admin Dashboard)

**Backend:**
- Node.js 20 + Express
- PostgreSQL + PostGIS
- Redis 7
- MongoDB
- CouchDB (Sync Server)

**ML / Inteligencia:**
- Python 3.11 + TensorFlow
- TensorFlow Lite (on-device models)
- MLflow (Model Management)

**Infraestructura:**
- AWS (São Paulo region)
- Cloudflare (CDN, WAF)
- Firebase (Push, Analytics)
- Docker + GitHub Actions

## 🚀 Quick Start

### Requisitos previos
- Node.js 20+
- pnpm 8+
- Docker + Docker Compose
- Python 3.11+ (opcional, para ML)

### Setup local

1. **Clonar repositorio y instalar dependencias**
   ```bash
   git clone <repo>
   cd TAXI-APP
   pnpm install
   ```

2. **Levantar stack de desarrollo (Docker)**
   ```bash
   pnpm docker:up
   ```
   Esto levanta: PostgreSQL + PostGIS, Redis, MongoDB, CouchDB

3. **Crear archivo .env**
   ```bash
   cp .env.example .env
   # Editar .env con credenciales locales
   ```

4. **Correr aplicaciones en desarrollo**
   ```bash
   pnpm dev
   ```
   - Backend: http://localhost:3000
   - Web: http://localhost:3001
   - Admin: http://localhost:3002

### Scripts útiles

```bash
pnpm build       # Build all apps
pnpm lint        # Lint all apps
pnpm test        # Run tests
pnpm format      # Format code
pnpm docker:logs # Ver logs de contenedores
pnpm docker:down # Detener servicios
```

## 📁 Estructura del Proyecto

```
TAXI-APP/
├── apps/
│   ├── backend/          # API Express (microservicios)
│   ├── mobile/           # Flutter app (iOS + Android)
│   ├── web/              # React PWA
│   └── admin/            # Next.js dashboard
├── services/
│   ├── ml/               # ML services (Python/TensorFlow)
│   └── sync/             # CouchDB sync server
├── infra/
│   ├── docker-compose.yml
│   └── terraform/        # AWS IaC
├── docs/                 # Documentation
└── .github/workflows/    # CI/CD
```

## 📖 Documentación

- [SETUP.md](./docs/SETUP.md) - Guía de instalación detallada
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Decisiones arquitectónicas
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía de contribución
- [API_SPEC.md](./docs/API_SPEC.md) - Especificación de APIs

## 🔒 Seguridad

- Autenticación: Auth0 + MFA adaptativo
- Fraude: Motor de detección en tiempo real
- Datos: Cumplimiento Ley 29733, on-device processing
- Infraestructura: WAF, Vault, cifrado E2E

## 📊 Roadmap

**MVP (Meses 0-4):** Validar PMF en 3 distritos (Miraflores, San Isidro, San Borja)
- 100 conductores, 1,000 usuarios, 5,000 viajes
- NPS >50, tiempo espera <5min

**Post-MVP:** Expansión a provincias, formalización masiva, marketplace de servicios

## 🤝 Contribución

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para:
- Branch strategy (main, dev, feature/*)
- Commit message guidelines
- PR process
- Code style (ESLint, Prettier)

## 📝 Licencia

Propietario - Axiom Perú S.A.C.

## 📧 Contacto

- Dev Team: dev@axiom.pe
- Docs: https://docs.axiom.pe
