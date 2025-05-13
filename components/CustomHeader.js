import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';

/**
 * A custom header component for consistent styling across the app
 * @param {string} title - The header title
 * @param {Function} onBackPress - Function to call when the back button is pressed
 * @param {boolean} showBack - Whether to show the back button
 * @param {JSX.Element} rightComponent - Component to show on the right side of the header
 */
const CustomHeader = ({ title, onBackPress, showBack = true, rightComponent }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        {showBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#7B9CFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3A59',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F9FB',
  },
  rightContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;
