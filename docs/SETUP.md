# Setup Guide - Axiom Perú

## Requisitos del Sistema

### Mínimos
- **OS:** macOS 12+, Linux (Ubuntu 22+), Windows 11 Pro
- **Node.js:** 20.0.0 o superior
- **npm:** 10.0.0 o superior (incluido con Node.js)
- **Docker:** 20.10+ con Docker Compose 2.0+
- **RAM:** 8GB mínimo (16GB recomendado)
- **Disco:** 20GB libres

### Para desarrollo mobile (Flutter)
- **Flutter SDK:** 3.16+ con Dart SDK 3.2+
- **Android SDK:** API level 21+ (para Android 5.0)
- **Xcode:** 14.0+ (para iOS)

### Para ML (Python)
- **Python:** 3.11.0+
- **pip:** 23.0+
- **virtualenv** o similar

## Instalación Paso a Paso

### 1. Clonar repositorio
```bash
git clone https://github.com/axiom-peru/TAXI-APP.git
cd TAXI-APP
```

### 2. Instalar Node.js
```bash
# Verificar Node.js 20+
node --version  # v20.0.0+

# npm viene incluido con Node.js
npm --version   # 10.0.0+
```

### 3. Instalar dependencias
```bash
npm install
# Esto instala deps root + todos los workspaces
```

### 4. Configurar entorno local
```bash
# Copiar variables de ejemplo
cp .env.example .env

# Editar .env con credenciales locales
# Por defecto, todo usa localhost con credenciales test
cat .env
```

### 5. Levantar servicios con Docker
```bash
# Subir stack de desarrollo
npm run docker:up

# Verificar que todos estén healthy
docker-compose -f infra/docker-compose.yml ps

# Ver logs
npm run docker:logs
```

**Servicios levantados:**
- PostgreSQL: `localhost:5432` (user: postgres, pass: postgres)
- Redis: `localhost:6379`
- MongoDB: `localhost:27017` (user: admin, pass: password)
- CouchDB: `http://localhost:5984` (user: admin, pass: password)

### 6. Inicializar base de datos
```bash
# Crear schema de PostgreSQL (cuando esté listo el backend)
npm --workspace=@axiom/backend run db:migrate

# Seed de datos de desarrollo (opcional)
npm --workspace=@axiom/backend run db:seed
```

### 7. Correr aplicaciones en desarrollo
```bash
# Todos los apps en paralelo
npm run dev

# O correr apps individuales:
npm --workspace=@axiom/backend run dev    # Backend: :3000
npm --workspace=@axiom/web run dev        # Web: :3001
npm --workspace=@axiom/admin run dev      # Admin: :3002
npm --workspace=@axiom/ml run dev         # ML API: :5000
```

**Accesos:**
- Backend API: http://localhost:3000
- Web App: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- ML API: http://localhost:5000
- CouchDB Admin: http://localhost:5984/_utils

## Desarrollo Mobile (Flutter)

### Setup Flutter
```bash
# Descargar Flutter SDK
# https://flutter.dev/docs/get-started/install

# Verificar setup
flutter doctor

# Luego en apps/mobile/
cd apps/mobile
flutter pub get
```

### Ejecutar en emulador/device
```bash
cd apps/mobile

# iOS (macOS solamente)
flutter run -d <device-id>

# Android
flutter run -d <device-id>

# Build APK para testing
flutter build apk --split-per-abi
```

## Desarrollo Python/ML

### Setup virtual environment
```bash
cd services/ml
python3 -m venv venv

# Activar venv
source venv/bin/activate  # Linux/macOS
# o en Windows:
venv\Scripts\activate

# Instalar dependencies
pip install -r requirements.txt
```

### Correr servicios ML
```bash
cd services/ml
source venv/bin/activate
python src/main.py
```

## Testing

### Correr todos los tests
```bash
npm run test
```

### Tests por app
```bash
npm --workspace=@axiom/backend run test
npm --workspace=@axiom/web run test
npm --workspace=@axiom/admin run test
```

### Coverage
```bash
npm --workspace=@axiom/backend run test:coverage
```

## Linting y Formatting

### Lint todo
```bash
npm run lint
```

### Format código
```bash
npm run format
```

### Type checking
```bash
npm run type-check
```

## Troubleshooting

### "npm: command not found"
```bash
# Reinstalar Node.js desde https://nodejs.org/
node --version  # Debe ser 20+
npm --version   # Debe ser 10+
```

### Docker no levanta
```bash
# Ver logs detallados
docker-compose -f infra/docker-compose.yml logs

# Limpiar y reintentar
docker-compose -f infra/docker-compose.yml down -v
docker-compose -f infra/docker-compose.yml up -d
```

### Puerto ya está en uso
```bash
# Cambiar puerto en .env o apagar servicio conflictivo
lsof -i :3000  # Ver qué usa puerto 3000
kill -9 <PID>
```

### Node version mismatch
```bash
# Usar nvm (Node Version Manager)
nvm install 20
nvm use 20
```

### PostgreSQL connection refused
```bash
# Esperar a que PostgreSQL esté healthy
docker-compose -f infra/docker-compose.yml ps

# Ver logs
docker logs axiom_postgres
```

## Comandos útiles

```bash
# Ver estructura del workspace
npm list --depth=0

# Limpiar node_modules y reinstalar
# Limpiar todo (use with caution)
rm -rf node_modules
rm -f package-lock.json
npm install

# Build production
npm run build

# Actualizar dependencias
npm update

# Encontrar vulnerabilidades
npm audit

# Ver archivos cambiados (git)
git status
```

## IDE / Editor Setup

### VS Code
Extensiones recomendadas:
- ESLint
- Prettier - Code formatter
- Thunder Client (testing APIs)
- Docker
- Tailwind CSS IntelliSense
- Flutter (si trabajas mobile)

### Configuración recomendada
En `.vscode/settings.json` (crear si no existe):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Próximos pasos

1. Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para workflow de desarrollo
2. Leer [ARCHITECTURE.md](./ARCHITECTURE.md) para entender decisiones técnicas
3. Revisar [API_SPEC.md](./API_SPEC.md) para detalles de APIs
4. Unirse al Slack/Discord para preguntas

## Soporte

- Documentación: https://docs.axiom.pe
- Issues: GitHub Issues
- Chat: dev@axiom.pe
