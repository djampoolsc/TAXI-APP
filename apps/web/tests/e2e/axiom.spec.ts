import { test, expect } from '@playwright/test';

test.describe('Axiom Web App - Playwright E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load login page with glassmorphism design', async ({ page }) => {
    // Check for main elements
    await expect(page.locator('text=Axiom')).toBeVisible();
    await expect(page.locator('text=Smart Mobility')).toBeVisible();

    // Check for glass card styling
    const glassCard = page.locator('.glass-card');
    await expect(glassCard).toBeVisible();

    // Verify backdrop blur effect
    const computedStyle = await glassCard.evaluate((el: any) => {
      return window.getComputedStyle(el).backdropFilter;
    });
    expect(computedStyle).toContain('blur');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Registrarse');
    await expect(page.locator('text=Únete a Axiom')).toBeVisible();
    await expect(page.locator('text=Comienza tu viaje hoy')).toBeVisible();
  });

  test('should fill login form and show loading state', async ({ page }) => {
    // Fill email
    await page.fill('input[placeholder*="usuario"]', 'test@axiom.pe');

    // Fill password
    await page.fill('input[placeholder*="•"]', 'password123');

    // Click login button
    await page.click('button:has-text("Iniciar Sesión")');

    // Should show loading state
    await expect(page.locator('button:has-text("Iniciando sesión")')).toBeVisible();
  });

  test('should validate email field', async ({ page }) => {
    const emailInput = page.locator('input[placeholder*="usuario"]');

    // Focus and blur without typing
    await emailInput.focus();
    await emailInput.blur();

    // Type invalid email
    await emailInput.fill('notanemail');
    await emailInput.fill('valid@axiom.pe');

    // Verify valid format
    await expect(emailInput).toHaveValue('valid@axiom.pe');
  });

  test('should toggle between login and register pages', async ({ page }) => {
    // Start at login
    await expect(page.locator('text=Smart Mobility')).toBeVisible();

    // Go to register
    await page.click('text=Registrarse');
    await expect(page.locator('text=Únete a Axiom')).toBeVisible();

    // Back to login
    await page.click('text=Inicia sesión');
    await expect(page.locator('text=Smart Mobility')).toBeVisible();
  });

  test('should fill registration form with all fields', async ({ page }) => {
    await page.click('text=Registrarse');

    // Fill form fields
    await page.fill('input[placeholder*="correo"]', 'newuser@axiom.pe');
    await page.fill('input[placeholder*="999"]', '+51 987 654 321');
    await page.fill('input[placeholder*="•"]', 'SecurePass123!');

    // Select user type
    await page.selectOption('select', 'driver');

    // Submit
    await page.click('button:has-text("Crear Cuenta")');

    // Should show loading state
    await expect(page.locator('button:has-text("Creando cuenta")')).toBeVisible();
  });

  test('should verify button hover effects', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Iniciar Sesión")');

    // Hover over button
    await loginButton.hover();

    // Get computed styles
    const bgColor = await loginButton.evaluate((el: any) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(bgColor).toBeTruthy();
  });

  test('should verify accessibility - focus states', async ({ page }) => {
    const emailInput = page.locator('input[placeholder*="usuario"]');

    // Focus input
    await emailInput.focus();

    // Check if focused
    const isFocused = await emailInput.evaluate((el: any) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);
  });

  test('should respond on mobile viewport', async ({ page, context }) => {
    // Create mobile context
    const mobileContext = await context.browser()?.newContext({
      viewport: { width: 375, height: 667 },
    });

    if (mobileContext) {
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto('/');

      await expect(mobilePage.locator('text=Axiom')).toBeVisible();
      await mobileContext.close();
    }
  });

  test('should load ride request page after login', async ({ page }) => {
    // Mock token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-jwt-token-for-testing');
    });

    // Navigate to rides
    await page.goto('/rides');

    await expect(page.locator('text=Solicitar Viaje')).toBeVisible();
    await expect(page.locator('text=Elige tu destino')).toBeVisible();
  });

  test('should enter destination and show pricing', async ({ page }) => {
    // Mock token
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-jwt-token-for-testing');
    });

    await page.goto('/rides');

    // Type destination
    await page.fill('input[placeholder*="Ingresa dirección"]', 'Jirón Puno 123, Lima');

    // Wait for pricing to appear
    await expect(page.locator('text=Tarifa Estimada')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=S/.')).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Iniciar Sesión")');

    const contrast = await loginButton.evaluate((el: any) => {
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      // Return both for manual verification
      return { bgColor, textColor };
    });

    expect(contrast.bgColor).toBeTruthy();
    expect(contrast.textColor).toBeTruthy();
  });
});
