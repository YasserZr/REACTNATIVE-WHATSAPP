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
            const discussionNode = discussionsData[idDesc]; // Get the whole discussion node
            let otherUserId = null;

            if (idDesc.includes(currentUserId)) {
              if (idDesc.startsWith(currentUserId)) {
                otherUserId = idDesc.substring(currentUserId.length);
              } else if (idDesc.endsWith(currentUserId)) {
                otherUserId = idDesc.substring(0, idDesc.length - currentUserId.length);
              }
              if (otherUserId === currentUserId || otherUserId === '') {
                return null;
              }
            } else {
              return null;
            }
            if (!otherUserId) return null;

            // Extract last message and unread count
            const lastMessage = discussionNode.lastMessage || null;
            const unreadCount = (discussionNode.unreadCounts && discussionNode.unreadCounts[currentUserId]) || 0;

            return {
              id: idDesc,
              otherUserId: otherUserId,
              lastMessage: lastMessage, // Add lastMessage to the discussion object
              unreadCount: unreadCount, // Add unreadCount for the current user
            };
          })
          .filter(Boolean);
        
        // Sort discussions: those with unread messages first, then by last message timestamp
        discussionsArray.sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
          if (a.lastMessage && b.lastMessage) {
            return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
          }
          if (a.lastMessage) return -1; // Discussions with a last message come before those without
          if (b.lastMessage) return 1;
          return 0;
        });
        
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
          <View style={styles.discussionRow}>
            <TouchableOpacity
              style={styles.discussionItem}
              onPress={() => {
                if (currentUserId && item.otherUserId) {
                  // When navigating to chat, unread count is reset by Chat.js's useFocusEffect
                  navigation.navigate('Chat', {
                    currentUserId: currentUserId,
                    userId: item.otherUserId,
                  });
                } else {
                  console.warn("Navigation to chat aborted: Missing currentUserId or otherUserId.", { currentUserId, otherUserId: item.otherUserId });
                }
              }}
            >
              <View style={styles.discussionTextContainer}>
                <Text style={styles.discussionUserText}>Chat with: {item.otherUserId}</Text>
                {item.lastMessage && (
                  <Text style={styles.lastMessageText} numberOfLines={1}>
                    {item.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                    {item.lastMessage.text}
                  </Text>
                )}
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
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
    backgroundColor: '#f4f6fb',
    paddingTop: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#e53935',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discussionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  discussionItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  discussionTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  discussionUserText: {
    fontSize: 20,
    color: '#1a237e',
    fontWeight: 'bold',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#5c6bc0',
    borderRadius: 16,
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 10,
    shadowColor: '#5c6bc0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f4f6fb',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#e53935',
    fontSize: 17,
    fontWeight: 'bold',
  },
});