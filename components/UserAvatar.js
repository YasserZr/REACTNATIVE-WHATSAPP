import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

/**
 * A user avatar component that shows the user's profile picture
 * or initial letter if no image is available
 * 
 * @param {string} source - Image source or uri to display
 * @param {number} size - Avatar size in pixels
 * @param {string} name - User name to display initial from if no image
 * @param {Object} style - Additional style for the avatar container
 */
const UserAvatar = ({ 
  source, 
  size = 60, 
  name = "User", 
  style = {} 
}) => {
  // Get first letter of name for placeholder
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  
  // Dynamic styles based on size prop
  const dynamicStyles = {
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    initialText: {
      fontSize: size * 0.4,
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container, style]}>
      {source ? (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={styles.image}
        />
      ) : (
        <Text style={[styles.initialText, dynamicStyles.initialText]}>{initial}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderWidth: 3,
    borderColor: '#7B9CFF',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialText: {
    color: '#7B9CFF',
    fontWeight: 'bold',
  }
});

export default UserAvatar;
