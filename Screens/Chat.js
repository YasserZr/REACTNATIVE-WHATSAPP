import firebase from '../config';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

const database = firebase.database();
const ref_database = database.ref();
const ref_lesdiscussions = ref_database.child('listes_discussionsGL1');

export default function Chat(props) {
  const currentUserId = props.route.params.currentUserId;
  const userId = props.route.params.userId;

  const idDesc = currentUserId > userId ? currentUserId + userId : userId + currentUserId;
  const ref_unediscussion = ref_lesdiscussions.child(idDesc);
  const ref_Messages = ref_unediscussion.child("Messages");
  const ref_istyping = ref_unediscussion.child(`${userId}_isTyping`);

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
  }, []);

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
  }, []);

  const handleSend = () => {
    if (msg.trim() === '') return;

    const key = ref_Messages.push().key;
    const ref_unmsg = ref_Messages.child(key);
    ref_unmsg.set({
      body: msg,
      senderId: currentUserId,
      receiverId: userId,
      timestamp: new Date().toISOString(),
    });
    setMsg('');
    ref_unediscussion.child(`${currentUserId}_isTyping`).set(false); // stop typing
  };

  return (
    <View style={styles.container}>
      {istyping && <Text style={styles.typingText}>User is typing...</Text>}

      <FlatList
        style={styles.flatList}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={msg}
          onChangeText={setMsg}
          onFocus={() => ref_unediscussion.child(`${currentUserId}_isTyping`).set(true)}
          onBlur={() => ref_unediscussion.child(`${currentUserId}_isTyping`).set(false)}
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
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  typingText: {
    fontStyle: 'italic',
    color: 'gray',
    marginBottom: 5,
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
