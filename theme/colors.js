/**
 * App theme colors
 * This file centralizes all color definitions for the app
 * to maintain consistency across all components
 */
export const colors = {
  // Primary colors
  primary: '#7B9CFF',
  primaryDark: '#5A7EE5',
  primaryLight: '#A8BBFF',

  // Secondary colors
  secondary: '#FFB6C1',
  secondaryDark: '#FF93A2',
  secondaryLight: '#FFC8D1',

  // UI Element colors
  background: '#F8F9FB',
  card: '#FFFFFF',
  input: '#F0F2F5',
  border: '#E3E8F0',
  
  // Text colors
  textPrimary: '#2E3A59',
  textSecondary: '#8E97A9',
  textLight: '#FFFFFF',

  // Status colors
  success: '#94E1B4',
  successDark: '#71C496',
  error: '#FF7E87',
  errorDark: '#E56973',
  warning: '#FFC480',
  info: '#80C4FF',
};

/**
 * Common style presets that can be reused across components
 */
export const stylePresets = {
  // Shadow presets
  shadowSmall: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  shadowMedium: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  shadowLarge: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Card presets
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    ...this.shadowMedium,
  },
  
  // Button presets
  buttonBase: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default { colors, stylePresets };
