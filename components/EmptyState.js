import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { colors } from '../theme/colors';

/**
 * A component that displays an empty state message with an icon
 * @param {string} message - The message to display
 * @param {string} icon - The icon name from MaterialCommunityIcons
 * @param {Object} style - Additional style for the container
 */
const EmptyState = ({ 
  message = "No items to display", 
  icon = "information-outline",
  style = {} 
}) => {
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={70} 
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  icon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  message: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});

export default EmptyState;
