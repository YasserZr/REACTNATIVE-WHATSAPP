import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * A custom button component with consistent styling
 * @param {string} title - Button text
 * @param {Function} onPress - Function to call when button is pressed
 * @param {string} type - Button type: 'primary', 'secondary', 'danger'
 * @param {boolean} loading - Whether to show loading indicator
 * @param {boolean} disabled - Whether button is disabled
 * @param {Object} style - Additional style for the button
 */
const CustomButton = ({ 
  title, 
  onPress, 
  type = 'primary',
  loading = false,
  disabled = false,
  style = {}
}) => {
  // Determine button style based on type
  const buttonTypeStyle = 
    type === 'primary' ? styles.primaryButton : 
    type === 'secondary' ? styles.secondaryButton : 
    styles.dangerButton;
  
  // Determine text color based on type
  const textColor = 
    type === 'secondary' ? '#7B9CFF' : '#FFFFFF';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonTypeStyle,
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: '#7B9CFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#7B9CFF',
  },
  dangerButton: {
    backgroundColor: '#FF7E87',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});

export default CustomButton;
