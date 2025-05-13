import firebase from '../config';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

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

  const idDesc = currentUserId > userId ? currentUserId + userId : userId + currentUserId;
  const ref_unediscussion = ref_lesdiscussions.child(idDesc);
  const ref_Messages = ref_unediscussion.child("Messages");
  const ref_istyping = ref_unediscussion.child(`${userId}_isTyping`); // Should this be other user's ID?

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [istyping, setIstyping] = useState(false);

  // Typing listener
  useEffect(() => {
    const listener = ref_istyping.on("value", snapshot => {
      setIstyping(!!snapshot.val()); // Ensure boolean
    });

    return () => {
      ref_istyping.off("value", listener);
    };
  }, [ref_istyping]); // Add ref_istyping to dependency array as it's formed using userId

  // Messages listener
  useEffect(() => {
    const listener = ref_Messages.on('value', (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
      setMessages(d);
    });

    return () => {
      ref_Messages.off('value', listener);
    };
  }, [ref_Messages]); // Add ref_Messages to dependency array

  const handleSend = () => {
    if (msg.trim() === '') return;

    const key = ref_Messages.push().key;
    const ref_unmsg = ref_Messages.child(key);
    ref_unmsg.set({
      body: msg,
      senderId: currentUserId,
      receiverId: userId, // This should be the ID of the other user
      timestamp: new Date().toISOString(),
    });
    setMsg('');
    // When current user sends a message, their typing status should be set to false
    ref_unediscussion.child(`${currentUserId}_isTyping`).set(false);
  };

  return (
    <View style={styles.container}>
      {/* Display typing status for the other user */}
      {istyping && <Text style={styles.typingText}>{`User ${userId} is typing...`}</Text>}

      <FlatList
        style={styles.flatList}
        data={messages}
        keyExtractor={(item, index) => item.timestamp + index} // Use a more unique key if possible
        renderItem={({ item }) => (
          <View 
            style={[
              styles.messageBubble,
              item.senderId === currentUserId ? styles.currentUserMessage : styles.otherUserMessage
            ]}
          >
            <Text style={styles.messageText}>{item.body}</Text>
            {/* Optionally display timestamp or sender info */}
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
            ref_unediscussion.child(`${currentUserId}_isTyping`).set(text.length > 0);
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