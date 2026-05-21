# Contributing Guide - Axiom Perú

Gracias por contribuir a Axiom Perú. Este documento define cómo trabajamos juntos.

## Branch Strategy

```
main
├── production-ready, tagged releases
└── Merges solo desde release/ branches

dev
└── development branch, merges de feature branches
    └── feature/*, bugfix/*, refactor/* branches
```

### Naming Conventions

- **Feature:** `feature/user-auth` o `feature/AXIOM-123-user-auth`
- **Bugfix:** `bugfix/login-crash` o `bugfix/AXIOM-456-login-crash`
- **Hotfix:** `hotfix/payment-error` (solo desde main)
- **Refactor:** `refactor/auth-service` o `refactor/AXIOM-789`
- **Docs:** `docs/api-specification`

## Workflow de Desarrollo

1. **Crear rama desde `dev`**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   ```

2. **Trabajar en tu rama**
   ```bash
   git add .
   git commit -m "feat: add user authentication"
   ```

3. **Push a origin**
   ```bash
   git push origin feature/my-feature
   ```

4. **Crear Pull Request**
   - Ir a GitHub
   - Crear PR: `feature/my-feature` → `dev`
   - Llenar template de PR
   - Pedir review a al menos 1 reviewer

5. **Code Review + Merge**
   - Feedback en PR
   - Aprobar cambios
   - Merge (squash si son muchos commits)

6. **Release a Production**
   - Crear rama `release/v1.0.0` desde `dev`
   - Tests finales
   - Merge a `main` y tag
   - Merge a `dev` (para sync)

## Commit Messages

Usamos **Conventional Commits** para mantener historial claro.

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat:** Feature nueva
- **fix:** Corrección de bug
- **docs:** Cambios en documentación
- **style:** Formatting, missing semicolons, etc.
- **refactor:** Refactorización de código
- **perf:** Mejoras de performance
- **test:** Agregar o actualizar tests
- **chore:** Cambios build, deps, CI/CD

### Ejemplos

```
feat(auth): add MFA support for registration

- Implement TOTP-based MFA
- Add biometric verification fallback
- Update Auth0 integration

Closes #AXIOM-123

---

fix(matching): prevent duplicate ride matching

Race condition in matching service caused drivers
to receive multiple acceptances for same ride.

Use distributed lock (Redis) to serialize matching logic.

---

docs(setup): add troubleshooting section
```

### Buenas prácticas

- ✅ Commits pequeños y atómicos
- ✅ Mensaje imperativo: "add feature", no "added feature"
- ✅ Primera línea < 50 caracteres
- ✅ Cerrar issues en footer: `Closes #AXIOM-123`
- ❌ No "fixed typo" o "WIP", squashea primero

## Código

### Style Guide

- **Lenguaje:** TypeScript > JavaScript (type safety)
- **Formatting:** Prettier (check: `pnpm format`)
- **Linting:** ESLint (`pnpm lint`)
- **Indentation:** 2 spaces

### Convenciones de Naming

- Variables/functions: `camelCase` → `getUserProfile()`
- Classes: `PascalCase` → `UserAuthService`
- Constants: `UPPER_SNAKE_CASE` → `MAX_RETRIES`
- Files/Folders: `kebab-case` → `user-auth.ts`

### Principios

1. **No magic numbers**: define constantes
   ```typescript
   const MAX_RETRY_ATTEMPTS = 3; // good
   if (attempts > 3) { }          // bad
   ```

2. **Funciones pequeñas y claras**
   ```typescript
   // good: función clara con un propósito
   async function validatePhoneNumber(phone: string): Promise<boolean> {
     return /^\+51\d{9}$/.test(phone);
   }
   ```

3. **Error handling**
   ```typescript
   try {
     await processPayment(orderId);
   } catch (error) {
     logger.error('Payment failed', { orderId, error });
     throw new PaymentError('Unable to process', { cause: error });
   }
   ```

4. **Tipos explícitos**
   ```typescript
   // good
   function fetchUser(userId: string): Promise<User> { }
   
   // bad
   function fetchUser(userId) { }
   ```

## Testing

### Coverage Requerida

- Backend: 80%+ (critical paths 100%)
- Frontend: 70%+
- ML services: 85%+

### Tipos de tests

- **Unit:** `*.test.ts` (Jest)
- **Integration:** `*.integration.test.ts` (con DB real)
- **E2E:** `*.e2e.test.ts` (Cypress/Playwright)

### Ejemplo

```typescript
describe('UserAuthService', () => {
  it('should authenticate user with valid credentials', async () => {
    const user = await authService.login('user@axiom.pe', 'password123');
    expect(user).toHaveProperty('id');
    expect(user.token).toBeTruthy();
  });

  it('should reject invalid credentials', async () => {
    await expect(
      authService.login('user@axiom.pe', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

## Pull Request

### Template de PR

```markdown
## Description
Qué cambios haces y por qué.

## Related Issues
Closes #AXIOM-123

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Docs

## How to Test
Pasos para testear cambios localmente.

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Docs updated if needed
- [ ] No breaking changes
```

### Code Review Checklist

Reviewers verifican:
- ✅ Código sigue style guide
- ✅ Tests presentes y passing
- ✅ No hard-coded secrets/credentials
- ✅ Performance acceptable
- ✅ Documentation actualizada
- ✅ Commits limpios y bien mensajeados

## Performance

### Antes de hacer PR

```bash
# Verificar que todo compila y pasa tests
pnpm build
pnpm test

# Checkear ESLint y format
pnpm lint
pnpm format --check

# Type checking
pnpm type-check
```

### Performance Profiling

```bash
# Backend (Node)
node --inspect apps/backend/dist/index.js

# Frontend (React DevTools)
# Chrome DevTools → Performance tab

# Database queries
EXPLAIN ANALYZE SELECT ...;
```

## Documentation

- Documentar código complejo con comentarios claros
- Mantener README.md actualizado
- Documentar APIs con JSDoc
- Mantener changelog en CHANGELOG.md

### JSDoc Example

```typescript
/**
 * Calculates fare for a ride based on distance, time, and surge pricing.
 * 
 * @param distance - Distance in km
 * @param duration - Duration in minutes
 * @param surgeMultiplier - Current surge pricing multiplier (default: 1.0)
 * @returns Calculated fare in PEN
 */
function calculateFare(
  distance: number,
  duration: number,
  surgeMultiplier: number = 1.0
): number {
  return (BASE_FARE + distance * COST_PER_KM + duration * COST_PER_MIN) * surgeMultiplier;
}
```

## Deployment

### Pre-release Checklist

- [ ] Todos tests passing
- [ ] Changelog actualizado
- [ ] Version bumped (semver)
- [ ] Security audit passed (`pnpm audit`)
- [ ] Performance benchmarks OK
- [ ] Documentación actualizada

### Staging / Production

- Staging: auto-deploy desde `dev`
- Production: manual desde `main` tag

## Questions?

- 📧 Email: dev@axiom.pe
- 💬 Slack: #development
- 📚 Docs: https://docs.axiom.pe
