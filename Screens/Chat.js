import firebase from '../config';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

const database = firebase.database();
const ref_database = database.ref();
const ref_lesdiscussions = ref_database.child('listes_discussionsGL1');

export default function Chat(props) {
  const currentUserId = props.route.params.currentUserId;
  const userId = props.route.params.userId; // Get the current user ID from route params
  
  const idDesc = currentUserId > userId ? currentUserId + userId : userId + currentUserId;
  const ref_unediscussion = ref_lesdiscussions.child(idDesc);

  const ref_Messages = ref_unediscussion.child("Messages");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [istyping, setIstyping] = useState(false);

  const ref_istyping = ref_unediscussion.child(secondid+ "isTyping");

  useEffect(() => { 
    ref_istyping.on("value", (snapshot) => {  
      const d = snapshot.val();
      setIstyping(d);

      return () => {
        ref_istyping.off();  // Clean up the listener on unmount
      }


  })}, []);
  // recuperer la liste des messages
  useEffect(() => {
    const listener = ref_Messages.on('value', (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
      setMessages(d);
    });

    return () => {
      ref_Messages.off('value', listener); // Proper cleanup
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatList}
        data={messages}
        renderItem={({ item }) => {
          return (
            <View>
              <Text>{item.body}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          onFocus={() => {
            const ref_istyping = ref_unediscussion.child("isTyping").set(true);
          }}
          onBlur={() => {
            const ref_istyping = ref_unediscussion.child("isTyping").set(false);
          }}
          style={styles.input}
          value={msg} // Corrected from message to msg
          onChangeText={setMsg}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={() => {
          const key = ref_unediscussion.push().key;
          const ref_unmsg = ref_Messages.child(key);
          ref_unmsg.set({
            body: msg,
            senderId: currentUserId,
            recieverId: userId,
            timestamp: new Date().toLocaleDateString(),
          });
          setMsg(''); // Clear input field after sending
        }} />
      </View>
    </View>
  );
}

{istyping && <Text>is typing.... </Text>}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  messagesList: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    backgroundColor: '#dcdcdc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  flatList: {
    width: '98%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
});
