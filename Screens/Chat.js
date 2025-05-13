import firebase from '../config';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { MaterialCommunityIcons } from 'react-native-vector-icons';

const database = firebase.database();
const ref_database = database.ref();
const ref_lesdiscussions = ref_database.child('listes_discussionsGL1');

export default function Chat(props) {
  // Safely access route parameters
  const currentUserId = props.route?.params?.currentUserId;
  const userId = props.route?.params?.userId; // Assuming this is the ID of the other user in the chat

  // Handle missing parameters: If IDs are not available, don't proceed
  if (!currentUserId || !userId) {
    console.error("Chat.js: currentUserId or userId is missing from route params.");
    return (
      <View style={styles.container}>
        <Text>Error: Chat user information is missing.</Text>
        <Text>Please ensure you are navigating to this screen correctly with currentUserId and userId parameters.</Text>
      </View>
    );
  }

  // idDesc is stable if currentUserId and userId are stable
  const idDesc = currentUserId > userId ? currentUserId + userId : userId + currentUserId;

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [istyping, setIstyping] = useState(false);

  // Effect to reset unread count when chat is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId && idDesc) {
        const unreadCountsRef = ref_lesdiscussions.child(idDesc).child('unreadCounts').child(currentUserId);
        unreadCountsRef.set(0);
      }
      // Optional: Return a cleanup function if needed, though for set(0) it might not be critical
      return () => {
        // You could potentially do something when the screen goes out of focus
      };
    }, [currentUserId, idDesc])
  );

  // Typing listener
  useEffect(() => {
    const ref_unediscussion_typing = ref_lesdiscussions.child(idDesc);
    const ref_user_istyping = ref_unediscussion_typing.child(`${userId}_isTyping`);

    const listener = ref_user_istyping.on("value", snapshot => {
      setIstyping(!!snapshot.val()); // Ensure boolean
    });

    return () => {
      ref_user_istyping.off("value", listener);
    };
  }, [idDesc, userId]); // Depend on idDesc and userId

  // Messages listener
  useEffect(() => {
    const ref_unediscussion_messages = ref_lesdiscussions.child(idDesc);
    const ref_chat_messages = ref_unediscussion_messages.child("Messages");

    const listener = ref_chat_messages.on('value', (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        // Assuming each message from Firebase has a unique key
        d.push({ key: un_msg.key, ...un_msg.val() }); 
      });
      setMessages(d);
    });

    return () => {
      ref_chat_messages.off('value', listener);
    };
  }, [idDesc]); // Depend on idDesc

  const handleSend = () => {
    if (msg.trim() === '') return;

    const discussionRef = ref_lesdiscussions.child(idDesc);
    const messagesRef = discussionRef.child("Messages");
    const unreadCountsRef = discussionRef.child('unreadCounts');
    const lastMessageRef = discussionRef.child('lastMessage');

    const messageKey = messagesRef.push().key;
    if (!messageKey) {
      console.error("Failed to get a new message key from Firebase.");
      return;
    }
    const ref_unmsg = messagesRef.child(messageKey);
    const currentTimestamp = new Date().toISOString();

    const messageData = {
      body: msg,
      senderId: currentUserId,
      receiverId: userId, 
      timestamp: currentTimestamp,
      // key: messageKey // Firebase key is implicitly the node name, added to object in listener
    };

    ref_unmsg.set(messageData)
      .then(() => {
        setMsg('');
        // Update last message for the discussion
        lastMessageRef.set({
          text: msg,
          senderId: currentUserId,
          timestamp: currentTimestamp,
        });

        // Increment unread count for the receiver using a transaction
        unreadCountsRef.child(userId).transaction((currentCount) => {
          return (currentCount || 0) + 1;
        });

        // When current user sends a message, their typing status should be set to false
        discussionRef.child(`${currentUserId}_isTyping`).set(false);
      })
      .catch(error => {
        console.error("Error sending message or updating metadata: ", error);
        // Optionally, inform the user via an alert
      });
  };

  // Helper function to format timestamp into a "time ago" format
  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const seconds = Math.round((now - date) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);
      const weeks = Math.round(days / 7);
      const months = Math.round(days / 30.44); // Average days in a month

      if (seconds < 5) {
        return "just now";
      } else if (seconds < 60) {
        return `${seconds} seconds ago`;
      } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (weeks < 5) { // Roughly up to a month
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else if (months < 12) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        // For older than a year, you might want to show the date
        // For simplicity, let's stick to months or implement full date formatting
        return date.toLocaleDateString(); 
      }
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Display typing status for the other user */}
      {istyping && <Text style={styles.typingText}>{`User ${userId} is typing...`}</Text>}

      <FlatList
        style={styles.flatList}
        data={messages}
        keyExtractor={(item) => item.key} // Use the unique Firebase key for each message
        renderItem={({ item }) => (
          <View 
            style={[
              styles.messageBubble,
              item.senderId === currentUserId ? styles.currentUserMessage : styles.otherUserMessage
            ]}
          >
            <Text style={styles.messageText}>{item.body}</Text>
            <Text style={styles.timestampText}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        )}
        inverted // To show latest messages at the bottom
      />      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={msg}
          onChangeText={(text) => {
            setMsg(text);
            // Set typing status for the current user
            const ref_unediscussion_typing_current = ref_lesdiscussions.child(idDesc);
            ref_unediscussion_typing_current.child(`${currentUserId}_isTyping`).set(text.length > 0);
          }}
          placeholder="Type a message"
          placeholderTextColor="#8E97A9"
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={!msg.trim()}
        >
          <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F8F9FB',
  },
  typingText: {
    fontStyle: 'italic',
    color: '#7B9CFF',
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 26,
    maxWidth: '80%',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  currentUserMessage: {
    backgroundColor: '#7B9CFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherUserMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },  messageText: {
    fontSize: 17,
    color: '#2E3A59',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timestampText: {
    fontSize: 11,
    color: '#8E97A9',
    alignSelf: 'flex-end',
    marginTop: 6,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopColor: '#F0F2F5',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 10,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#F0F2F5',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 18,
    marginRight: 12,
    backgroundColor: '#F8F9FB',
    color: '#2E3A59',
    fontSize: 16,
  },  flatList: {
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#7B9CFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});