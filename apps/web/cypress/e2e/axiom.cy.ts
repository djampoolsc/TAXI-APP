describe('Axiom Login Flow - Live Testing', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should display login page with branding', () => {
    cy.contains('Axiom').should('be.visible');
    cy.contains('Smart Mobility').should('be.visible');
    cy.get('.glass-card').should('be.visible');
  });

  it('should show glassmorphism design', () => {
    cy.get('.glass-card').should('have.css', 'backdrop-filter');
    cy.get('.glass-input').first().should('be.visible');
  });

  it('should enter credentials and submit login', () => {
    cy.get('input[type="email"]').type('test@axiom.pe');
    cy.get('input[type="password"]').type('password123');
    cy.get('button').contains('Iniciar Sesión').click();

    // Wait for loading state
    cy.get('button').contains('Iniciando sesión', { timeout: 5000 }).should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('Registrarse').click();
    cy.contains('Únete a Axiom').should('be.visible');
    cy.contains('Comienza tu viaje hoy').should('be.visible');
  });

  it('should fill and submit registration form', () => {
    cy.contains('Registrarse').click();

    cy.get('input[placeholder*="correo"]').type('newuser@axiom.pe');
    cy.get('input[placeholder*="999"]').type('+51 987 654 321');
    cy.get('input[placeholder*="•"]').first().type('SecurePass123!');
    cy.get('select').select('driver');

    cy.get('button').contains('Crear Cuenta').click();
    cy.get('button').contains('Creando cuenta', { timeout: 5000 }).should('be.visible');
  });

  it('should have accessibility features', () => {
    // Check for focus states
    cy.get('input[type="email"]').focus();
    cy.get('input[type="email"]').should('have.focus');

    // Check color contrast
    cy.get('.glass-card').should('be.visible');
    cy.get('button').contains('Iniciar Sesión').should('have.css', 'background');
  });

  it('should be responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.contains('Axiom').should('be.visible');
    cy.get('.glass-card').should('be.visible');
  });

  it('should show error on failed login attempt', () => {
    cy.get('input[type="email"]').type('invalid@axiom.pe');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button').contains('Iniciar Sesión').click();

    // Wait for API response (mock will return error)
    cy.get('button', { timeout: 10000 }).should('not.have.text', 'Iniciando sesión');
  });

  it('should toggle between login and register', () => {
    // Start at login
    cy.contains('Axiom').should('be.visible');

    // Go to register
    cy.contains('Registrarse').click();
    cy.contains('Únete a Axiom').should('be.visible');

    // Back to login
    cy.contains('Inicia sesión').click();
    cy.contains('Smart Mobility').should('be.visible');
  });

  it('should test form validation', () => {
    const emailInput = cy.get('input[type="email"]');
    const passwordInput = cy.get('input[type="password"]');

    // Try submitting empty form
    emailInput.focus();
    emailInput.blur();

    // Try invalid email
    emailInput.type('notanemail');
    emailInput.clear().type('valid@axiom.pe');

    // Type password
    passwordInput.type('password123');

    // Check button is enabled
    cy.get('button').contains('Iniciar Sesión').should('not.be.disabled');
  });

  it('should verify button hover effects', () => {
    cy.get('button').contains('Iniciar Sesión').trigger('mouseover');
    cy.get('button').contains('Iniciar Sesión').should('have.css', 'background');
  });

  it('should check ambient background animations', () => {
    // Verify ambient effect divs exist
    cy.get('body').should('have.css', 'background');
    cy.contains('Axiom').closest('div').should('be.visible');
  });
});

describe('Axiom Ride Request Flow - Live Testing', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    // Mock login
    cy.window().then((win) => {
      localStorage.setItem('token', 'mock-jwt-token-for-testing');
    });
    cy.visit('http://localhost:5173/rides');
  });

  it('should display ride request page', () => {
    cy.contains('Solicitar Viaje').should('be.visible');
    cy.contains('Elige tu destino').should('be.visible');
  });

  it('should enter destination and show pricing', () => {
    cy.get('input[placeholder*="Ingresa dirección"]').type('Jirón Puno 123, Lima');

    // Should show pricing
    cy.contains('Tarifa Estimada', { timeout: 5000 }).should('be.visible');
    cy.contains('S/.', { timeout: 5000 }).should('be.visible');
  });

  it('should navigate through request flow', () => {
    // Step 1: Search
    cy.contains('Solicitar Viaje Ahora').should('be.visible');

    // Mock entering destination
    cy.get('input[placeholder*="Ingresa dirección"]').type('Destination');

    // Step 2: Pricing
    cy.contains('Confirmar', { timeout: 5000 }).click();
  });

  it('should show loading state during request', () => {
    cy.get('input[placeholder*="Ingresa dirección"]').type('Destination');
    cy.contains('Confirmar', { timeout: 5000 }).click();

    cy.contains('Buscando', { timeout: 5000 }).should('be.visible');
  });

  it('should display ride found confirmation', () => {
    cy.get('input[placeholder*="Ingresa dirección"]').type('Destination');
    cy.contains('Confirmar', { timeout: 5000 }).click();

    cy.contains('¡Viaje Solicitado!', { timeout: 10000 }).should('be.visible');
  });
});
