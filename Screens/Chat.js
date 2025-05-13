import firebase from '../config';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

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
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={msg}
          onChangeText={(text) => {
            setMsg(text);
            // Set typing status for the current user
            const ref_unediscussion_typing_current = ref_lesdiscussions.child(idDesc);
            ref_unediscussion_typing_current.child(`${currentUserId}_isTyping`).set(text.length > 0);
          }}
          // onFocus and onBlur might be redundant if onChangeText handles typing status
          // onFocus={() => ref_unediscussion.child(`${currentUserId}_isTyping`).set(true)}
          // onBlur={() => ref_unediscussion.child(`${currentUserId}_isTyping`).set(false)}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'flex-end', // Removed to allow FlatList to take space
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  typingText: {
    fontStyle: 'italic',
    color: 'gray',
    textAlign: 'center',
    paddingBottom: 5,
  },
  // messagesList: { // Not used, FlatList has its own style
  //   flex: 1,
  //   marginBottom: 10,
  // },
  messageBubble: { // Renamed from messageContainer for clarity
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    maxWidth: '80%',
  },
  currentUserMessage: {
    backgroundColor: '#DCF8C6', // Light green for current user
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherUserMessage: {
    backgroundColor: '#E5E5EA', // Light gray for other user
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestampText: { // Style for the timestamp
    fontSize: 10,
    color: '#666', // Lighter color for the timestamp
    alignSelf: 'flex-end', // Align to the right of the bubble
    marginTop: 4, // Add some space above the timestamp
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20, // Rounded input
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  flatList: {
    flex: 1, // Allow FlatList to grow
    // width: '98%', // Not needed if container handles padding
    // backgroundColor: '#fff', // Background is on container
    // borderRadius: 10, // Can be removed or kept based on preference
    // padding: 10, // Padding can be on message bubbles
    // marginBottom: 10, // Spacing handled by inputContainer's paddingTop
  },
});