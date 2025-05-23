// src/styles/colors.ts
export const colors = {
  // Main theme colors
  lavender: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  
  // Button specific colors
  plum: {
    DEFAULT: '#DDA0DD', // Plum color for buttons
    light: '#E6BBE6',
    dark: '#C17FC1',
  },
  
  // Text colors
  text: {
    primary: '#171717', // Grey blackish for button text
    secondary: '#525252',
    tertiary: '#737373',
    light: '#FAFAFA',
  },
  
  // System colors
  background: {
    light: '#FFFFFF',
    DEFAULT: '#FCFAFF', // Very light lavender tint
    dark: '#0A0A0A',
  },
  
  // Semantic colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Utility colors
  border: {
    light: '#E4E4E7',
    DEFAULT: '#D4D4D8',
    dark: '#A1A1AA',
  },
};

// For easier theme integration with Tailwind
export const extendedColors = {
  lavender: colors.lavender,
  plum: colors.plum,
  text: colors.text,
  background: colors.background,
  border: colors.border,
};

export default colors;