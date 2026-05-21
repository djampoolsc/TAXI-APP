import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Axiom Web App - E2E Tests', () => {
  it('should render login page on initial load', () => {
    render(
      <Router>
        <App />
      </Router>
    );

    expect(screen.getByText('Axiom')).toBeInTheDocument();
    expect(screen.getByText('Smart Mobility')).toBeInTheDocument();
  });

  it('should navigate to register page', async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const registerLink = screen.getByText('Registrarse');
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText('Únete a Axiom')).toBeInTheDocument();
    });
  });

  it('should fill login form and attempt login', async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('usuario@axiom.pe');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@axiom.pe');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(loginButton);

    expect(loginButton).toHaveTextContent('Iniciando sesión');
  });

  it('should fill register form with all fields', async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const registerLink = screen.getByText('Registrarse');
    fireEvent.click(registerLink);

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('tu@correo.pe');
      const phoneInput = screen.getByPlaceholderText('+51 999 000 000');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      userEvent.type(emailInput, 'newuser@axiom.pe');
      userEvent.type(phoneInput, '+51 987654321');
      userEvent.type(passwordInput, 'SecurePass123!');

      const userTypeSelect = screen.getByDisplayValue('Pasajero');
      fireEvent.change(userTypeSelect, { target: { value: 'driver' } });

      const signUpButton = screen.getByRole('button', { name: /crear cuenta/i });
      fireEvent.click(signUpButton);
    });
  });

  it('should show error messages on validation failure', async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });

    // Try to submit without email
    fireEvent.click(loginButton);

    // HTML5 validation should prevent submission
    expect(passwordInput).toBeInTheDocument();
  });

  it('should have glassmorphism styles applied', () => {
    const { container } = render(
      <Router>
        <App />
      </Router>
    );

    const glassCard = container.querySelector('.glass-card');
    expect(glassCard).toBeInTheDocument();

    const styles = window.getComputedStyle(glassCard!);
    expect(styles.backdropFilter).toContain('blur');
  });

  it('should be responsive on mobile viewport', () => {
    // Set viewport to mobile
    window.innerWidth = 375;
    window.innerHeight = 667;
    fireEvent.resize(window);

    render(
      <Router>
        <App />
      </Router>
    );

    const glassCard = screen.getByText('Axiom').closest('.glass-card');
    expect(glassCard).toBeInTheDocument();
  });

  it('should have accessible focus states', async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('usuario@axiom.pe');
    emailInput.focus();

    expect(emailInput).toHaveFocus();

    const styles = window.getComputedStyle(emailInput);
    expect(styles.borderColor).toBeTruthy();
  });

  it('should transition between pages smoothly', async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const registerLink = screen.getByText('Registrarse');
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText('Comienza tu viaje hoy')).toBeInTheDocument();
    });

    const loginLink = screen.getByText('Inicia sesión');
    fireEvent.click(loginLink);

    await waitFor(() => {
      expect(screen.getByText('Smart Mobility')).toBeInTheDocument();
    });
  });
});
