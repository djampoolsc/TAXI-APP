// Design System - Axiom Perú (FreshCart Style)
// Modern Vibrant UI Design Tokens

export const colors = {
  // Primary Brand - FreshCart Style (Vibrant Orange/Yellow)
  primary: {
    main: '#FFA500',      // Vibrant Orange
    dark: '#FF8C00',      // Dark Orange
    light: '#FFB84D',     // Light Orange
    lighter: '#FFD580',   // Even Lighter
    contrast: '#FFFFFF',  // White text
  },

  // Secondary - Complementary colors
  secondary: {
    main: '#FF6B35',      // Coral Red
    dark: '#E55100',      // Dark Coral
    light: '#FF9966',     // Light Coral
  },

  // Accent colors
  accent: {
    green: '#2ECC71',     // Success Green
    blue: '#3498DB',      // Info Blue
    purple: '#9B59B6',    // Purple accent
  },

  // Neutral - Clean whites and grays
  neutral: {
    white: '#FFFFFF',
    50: '#F9F9F9',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  // Gradients - FreshCart vibrant style
  gradients: {
    primary: 'linear-gradient(135deg, #FFA500 0%, #FFB84D 100%)',
    secondary: 'linear-gradient(135deg, #FF6B35 0%, #FFA500 100%)',
    dark: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
    success: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
  },

  // Glass Morphism - Updated for new theme
  glass: {
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(255, 165, 0, 0.1)',
    hover: 'rgba(255, 184, 77, 0.05)',
  },
};

export const typography = {
  fontFamily: {
    display: "'Poppins', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Poppins', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },

  fontWeight: {
    thin: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(255, 165, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(255, 165, 0, 0.15)',
  xl: '0 20px 25px -5px rgba(255, 165, 0, 0.2)',
  '2xl': '0 25px 50px -12px rgba(255, 165, 0, 0.25)',
  glass: '0 8px 32px 0 rgba(255, 165, 0, 0.2)',
  elevated: '0 12px 24px 0 rgba(0, 0, 0, 0.15)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
