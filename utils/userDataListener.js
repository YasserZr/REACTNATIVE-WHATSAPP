// Firebase user data listener for real-time updates
import { useEffect, useState } from 'react';
import firebase from '../config';

// Reference to the Firebase database
const database = firebase.database();
const ref_database = database.ref();
const ref_listComptes = ref_database.child("ListComptes");

/**
 * Hook to listen for changes to a user's profile data
 * @param {string} userId - The ID of the user to listen for
 * @returns {Object} - The user data
 */
export const useUserData = (userId) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Set up a real-time listener for the user's data
    const userRef = ref_listComptes.child(userId);
    
    const handleDataChange = (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
      setLoading(false);
    };
    
    // Listen for changes to the user's data
    userRef.on('value', handleDataChange);
    
    // Clean up the listener when the component unmounts
    return () => {
      userRef.off('value', handleDataChange);
    };
  }, [userId]);
  
  return { userData, loading };
};

/**
 * Hook to listen for changes to multiple users' profile data
 * @param {Array<string>} userIds - Array of user IDs to listen for
 * @returns {Object} - Object containing user data indexed by user ID
 */
export const useMultipleUsersData = (userIds = []) => {
  const [usersData, setUsersData] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const listeners = {};
    const userData = {};
    
    // Set up listeners for each user
    userIds.forEach(userId => {
      if (!userId) return;
      
      const userRef = ref_listComptes.child(userId);
      
      const handleDataChange = (snapshot) => {
        const data = snapshot.val();
        if (data) {
          userData[userId] = data;
          setUsersData({...userData});
        }
      };
      
      // Store the callback reference so we can remove it later
      listeners[userId] = handleDataChange;
      
      // Set up the listener
      userRef.on('value', handleDataChange);
    });
    
    setLoading(false);
    
    // Clean up listeners when component unmounts
    return () => {
      userIds.forEach(userId => {
        if (!userId) return;
        
        const userRef = ref_listComptes.child(userId);
        const listener = listeners[userId];
        if (listener) {
          userRef.off('value', listener);
        }
      });
    };
  }, [JSON.stringify(userIds)]); // Use JSON.stringify to detect array changes
  
  return { usersData, loading };
};

/**
 * Get current user data once (not a real-time listener)
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - Promise resolving to the user data
 */
export const getUserData = async (userId) => {
  if (!userId) return null;
  
  try {
    const snapshot = await ref_listComptes.child(userId).once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Force refresh user data across the app by updating a timestamp
 * @param {string} userId - The ID of the user to refresh
 * @returns {Promise<void>}
 */
export const refreshUserData = async (userId) => {
  if (!userId) return;
  
  try {
    // Update a lastUpdated timestamp to trigger listeners
    await ref_listComptes.child(userId).update({
      lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
    console.log('User data refresh triggered for:', userId);
  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
};
