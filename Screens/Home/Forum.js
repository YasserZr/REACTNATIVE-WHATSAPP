import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'; // Added Alert
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
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
        <ActivityIndicator size="large" color="#7B9CFF" />
        <Text style={styles.loadingText}>Loading discussions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState
        message={error}
        icon="alert-circle-outline"
      />
    );
  }
  
  // Additional check in case useEffect didn't set error but currentUserId is still missing
  if (!currentUserId) { 
    return (
      <EmptyState
        message="User ID not found. Cannot load discussions."
        icon="account-alert-outline"
      />
    );
  }

  if (discussions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <EmptyState
          message="No messages yet. Start chatting with someone from the Users tab!"
          icon="chat-outline"
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={discussions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.discussionRow}
            activeOpacity={0.7}
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
            <View style={styles.avatarContainer}>
              <UserAvatar
                size={50}
                name={item.otherUserId}
              />
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.discussionTextContainer}>
              <Text style={styles.discussionUserText}>
                {item.otherUserId && item.otherUserId.length > 15 
                  ? `${item.otherUserId.substring(0, 15)}...` 
                  : item.otherUserId || 'Chat'}
              </Text>
              {item.lastMessage && (
                <Text style={styles.lastMessageText} numberOfLines={1}>
                  {item.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                  {item.lastMessage.text}
                </Text>
              )}
            </View>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteDiscussion(item.id)}
            >
              <MaterialCommunityIcons name="delete-outline" size={22} color="#FF7E87" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 0,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    color: '#7B9CFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF7E87',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discussionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginVertical: 12,
    marginHorizontal: 8,
    padding: 16,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  discussionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  discussionUserText: {
    fontSize: 18,
    color: '#2E3A59',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessageText: {
    fontSize: 14,
    color: '#8E97A9',
    marginTop: 2,
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: '#7B9CFF',
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    position: 'absolute',
    top: -6,
    right: -6,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});