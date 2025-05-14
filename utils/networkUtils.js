// Network utilities for checking connectivity
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * Checks if the device has an active network connection
 * @returns {Promise<boolean>} - True if connected, false otherwise
 */
export const checkNetworkConnection = async () => {
  try {
    const networkState = await NetInfo.fetch();
    console.log('Network state:', networkState);
    
    return networkState.isConnected && networkState.isInternetReachable;
  } catch (error) {
    console.error('Error checking network connection:', error);
    return false;
  }
};

/**
 * Shows an alert if the device is not connected to the internet
 * @returns {Promise<boolean>} - True if connected, false otherwise
 */
export const ensureNetworkConnection = async () => {
  const isConnected = await checkNetworkConnection();
  
  if (!isConnected) {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
  
  return true;
};
