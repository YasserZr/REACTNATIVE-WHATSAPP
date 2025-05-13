import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'; // Added Alert
import firebase from '../../config'; // Adjusted path to Firebase config

const database = firebase.database();
const ref_lesdiscussions = database.ref('listes_discussionsGL1');

export default function Forum({ route, navigation }) {
  // currentUserId should be passed via route params, e.g., from a navigator after login
  // For testing, you might hardcode it or use a default, but in a real app, this is crucial.
  const currentUserId = route?.params?.currentUserId;

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUserId) {
      setError("Current user ID is not available. Please ensure you are logged in and the ID is passed to this screen.");
      setLoading(false);
      return;
    }
    setError(null); // Clear previous errors

    const listener = ref_lesdiscussions.on('value', (snapshot) => {
      const discussionsData = snapshot.val();
      if (discussionsData) {
        const discussionsArray = Object.keys(discussionsData)
          .map(idDesc => {
            // Determine the other user's ID
            // idDesc is a concatenation of two user IDs. We need to find the one that isn't currentUserId.
            let otherUserId = null;
            if (idDesc.includes(currentUserId)) {
              if (idDesc.startsWith(currentUserId)) {
                otherUserId = idDesc.substring(currentUserId.length);
              } else if (idDesc.endsWith(currentUserId)) {
                otherUserId = idDesc.substring(0, idDesc.length - currentUserId.length);
              }
              // If after splitting, otherUserId is an empty string or same as currentUserId (e.g. idDesc was just currentUserId twice)
              // This logic might need refinement based on how idDesc is strictly formed, especially for self-chats.
              if (otherUserId === currentUserId || otherUserId === '') {
                return null; // Or handle self-chats if they are possible and desired
              }
            } else {
              // This discussion does not involve the current user
              return null;
            }
            
            if (!otherUserId) return null; // Skip if otherUserId couldn't be determined

            return {
              id: idDesc, // The unique key for the discussion in Firebase (e.g., user1I Duser2ID)
              otherUserId: otherUserId, 
              // You might want to fetch other user's details (name, profile pic) here or later
            };
          })
          .filter(Boolean); // Remove any null entries from the map (e.g. discussions not involving current user)
        
        setDiscussions(discussionsArray);
      } else {
        setDiscussions([]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firebase read error in Forum.js:", err);
      setError("Failed to load discussions. Please check your connection or Firebase rules.");
      setLoading(false);
    });

    return () => {
      ref_lesdiscussions.off('value', listener);
    };
  }, [currentUserId]); // Re-run effect if currentUserId changes

  const handleDeleteDiscussion = (idDescToDelete) => {
    Alert.alert(
      "Delete Discussion",
      "Are you sure you want to delete this discussion? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            ref_lesdiscussions.child(idDescToDelete).remove()
              .then(() => {
                // Optimistically update the UI or rely on the listener to update.
                // For immediate feedback, filter out the deleted discussion from local state:
                setDiscussions(prevDiscussions => 
                  prevDiscussions.filter(discussion => discussion.id !== idDescToDelete)
                );
                // console.log(`Discussion ${idDescToDelete} deleted successfully.`);
              })
              .catch(error => {
                console.error(`Error deleting discussion ${idDescToDelete}:`, error);
                Alert.alert("Error", "Could not delete the discussion. Please try again.");
              });
          },
          style: "destructive"
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading discussions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  // Additional check in case useEffect didn't set error but currentUserId is still missing
  if (!currentUserId) { 
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>User ID not found. Cannot load discussions.</Text>
        </View>
    );
  }

  if (discussions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No discussions found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={discussions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.discussionRow}> {/* Wrap content and delete button */}
            <TouchableOpacity
              style={styles.discussionItem}
              onPress={() => {
                // Ensure both IDs are present before navigating
                if (currentUserId && item.otherUserId) {
                  navigation.navigate('Chat', {
                    currentUserId: currentUserId,
                    userId: item.otherUserId, // In Chat.js, 'userId' is the ID of the other user
                  });
                } else {
                  console.warn("Navigation to chat aborted: Missing currentUserId or otherUserId.", { currentUserId, otherUserId: item.otherUserId });
                  // Optionally, show an alert to the user
                }
              }}
            >
              {/* Displaying otherUserId. In a real app, you'd fetch and show their name. */}
              <Text style={styles.discussionText}>Chat with: {item.otherUserId}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteDiscussion(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background for the list
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  discussionRow: { // New style for the row container
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingHorizontal: 10, // Add some horizontal padding to the row
  },
  discussionItem: {
    flex: 1, // Allow text to take available space
    paddingVertical: 15,
    paddingHorizontal: 10, // Adjusted padding
  },
  discussionText: {
    fontSize: 18, // Larger font for readability
    color: '#333', // Darker text color
  },
  deleteButton: { // Style for the delete button
    padding: 10,
    // backgroundColor: 'red', // Optional: for better visibility
    // borderRadius: 5,
  },
  deleteButtonText: { // Style for the delete button text
    color: 'red',
    fontSize: 16,
  },
});