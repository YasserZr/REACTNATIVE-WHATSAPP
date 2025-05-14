import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useUserData } from '../utils/userDataListener';

/**
 * A user avatar component that shows the user's profile picture
 * or initial letter if no image is available
 * 
 * @param {string} source - Image source or uri to display (optional if userId is provided)
 * @param {string} userId - User ID to fetch profile data from Firebase
 * @param {number} size - Avatar size in pixels
 * @param {string} name - User name to display initial from if no image
 * @param {Object} style - Additional style for the avatar container
 * @param {boolean} realtime - Whether to use real-time updates (true) or static data (false)
 */
const UserAvatar = ({ 
  source, 
  userId,
  size = 60, 
  name = "User", 
  style = {},
  realtime = true
}) => {
  const [imageSource, setImageSource] = useState(source);
  const [displayName, setDisplayName] = useState(name);
  
  // Use the real-time user data hook if userId is provided and realtime is true
  const { userData, loading } = realtime && userId ? useUserData(userId) : { userData: null, loading: false };
  
  // Update local state when user data changes
  useEffect(() => {
    if (userData) {
      if (userData.profileImageUrl) {
        setImageSource(userData.profileImageUrl);
      }
      if (userData.pseudo) {
        setDisplayName(userData.pseudo);
      }
    }
  }, [userData]);
  
  // Get first letter of name for placeholder
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  
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

  // Show loading indicator when fetching user data
  if (loading && size > 30) {
    return (
      <View style={[styles.container, dynamicStyles.container, style, styles.loaderContainer]}>
        <ActivityIndicator size="small" color="#7B9CFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container, style]}>
      {imageSource ? (
        <Image
          source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
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
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default UserAvatar;
