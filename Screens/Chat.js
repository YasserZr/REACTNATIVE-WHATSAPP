import firebase from '../config';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import EmojiPicker from 'rn-emoji-keyboard';
import 'react-native-get-random-values';
import UserAvatar from '../components/UserAvatar';
import { useUserData } from '../utils/userDataListener';

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
  const idDesc = currentUserId > userId ? currentUserId + userId : userId + currentUserId;  const [messages, setMessages] = useState([]);  const [msg, setMsg] = useState('');
  const [istyping, setIstyping] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [userPseudo, setUserPseudo] = useState(props.route?.params?.userPseudo || userId);
  const [currentUserPseudo, setCurrentUserPseudo] = useState("");
  
  // Add states for message editing and menu visibility
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageMenuVisible, setMessageMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

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
  // Fetch user pseudo names
  useEffect(() => {
    const ref_listComptes = firebase.database().ref("ListComptes");
    
    // Get user pseudo
    const userListener = ref_listComptes.child(userId).on('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData && userData.pseudo) {
        setUserPseudo(userData.pseudo);
      }
    });
    
    // Get current user pseudo
    const currentUserListener = ref_listComptes.child(currentUserId).on('value', (snapshot) => {
      const currentUserData = snapshot.val();
      if (currentUserData && currentUserData.pseudo) {
        setCurrentUserPseudo(currentUserData.pseudo);
      }
    });
    
    return () => {
      ref_listComptes.child(userId).off('value', userListener);
      ref_listComptes.child(currentUserId).off('value', currentUserListener);
    };
  }, [userId, currentUserId]);

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
  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMsg((prevMsg) => prevMsg + emoji.emoji);
  };

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setIsEmojiPickerVisible(!isEmojiPickerVisible);
  };
  // Handle message options (edit/delete menu)
  const handleMessageOptions = (message) => {
    setSelectedMessage(message);
    setMessageMenuVisible(true);
  };
  
  // Start editing a message
  const startEditingMessage = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setMsg(selectedMessage.body);
      setMessageMenuVisible(false);
      // Scroll to the input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingMessage(null);
    setMsg('');
  };
  
  // Delete a message
  const deleteMessage = () => {
    if (selectedMessage && selectedMessage.key) {
      Alert.alert(
        "Delete Message",
        "Are you sure you want to delete this message?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              const discussionRef = ref_lesdiscussions.child(idDesc);
              const messageRef = discussionRef.child("Messages").child(selectedMessage.key);
              
              messageRef.remove()
                .then(() => {
                  console.log("Message deleted successfully");
                  setMessageMenuVisible(false);
                })
                .catch((error) => {
                  console.error("Error deleting message:", error);
                  Alert.alert("Error", "Failed to delete the message. Please try again.");
                });
            }
          }
        ]
      );
    }
  };

  const inputRef = useRef(null);

  const handleSend = () => {
    if (msg.trim() === '') return;

    const discussionRef = ref_lesdiscussions.child(idDesc);
    const messagesRef = discussionRef.child("Messages");
    const unreadCountsRef = discussionRef.child('unreadCounts');
    const lastMessageRef = discussionRef.child('lastMessage');
    
    const currentTimestamp = new Date().toISOString();

    // If we're editing a message
    if (editingMessage) {
      const ref_unmsg = messagesRef.child(editingMessage.key);
      
      ref_unmsg.update({
        body: msg,
        edited: true,
        editTimestamp: currentTimestamp,
      })
        .then(() => {
          setMsg('');
          setEditingMessage(null);
          
          // Update last message if this was the last message
          const latestMessages = [...messages].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          if (latestMessages.length > 0 && latestMessages[0].key === editingMessage.key) {
            lastMessageRef.update({
              text: msg,
              edited: true,
            });
          }
        })
        .catch(error => {
          console.error("Error updating message: ", error);
          Alert.alert("Error", "Failed to update the message. Please try again.");
        });
      
      return;
    }
    
    // Otherwise send a new message
    const messageKey = messagesRef.push().key;
    if (!messageKey) {
      console.error("Failed to get a new message key from Firebase.");
      return;
    }
    
    const ref_unmsg = messagesRef.child(messageKey);
    
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
        Alert.alert("Error", "Failed to send the message. Please try again.");
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
  // Update flatlist reference to scroll to bottom when messages change
  const flatListRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0 && !editingMessage) {
      // Add a small delay to ensure the FlatList has updated
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Display typing status for the other user */}
      {istyping && <Text style={styles.typingText}>{`${userPseudo} is typing...`}</Text>}
      
      {/* Display editing mode indicator */}
      {editingMessage && (
        <View style={styles.editingContainer}>
          <Text style={styles.editingText}>Editing message</Text>
          <TouchableOpacity onPress={cancelEditing} style={styles.cancelEditButton}>
            <MaterialCommunityIcons name="close" size={20} color="#FF7E87" />
          </TouchableOpacity>
        </View>
      )}
        <FlatList
        ref={flatListRef}
        style={styles.flatList}
        data={messages}        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.messagesContent} // Add this for proper padding
        renderItem={({ item }) => {
          const isCurrentUser = item.senderId === currentUserId;
          return (
            <View style={[
              styles.messageRow,
              isCurrentUser ? styles.currentUserRow : styles.otherUserRow
            ]}>
              {!isCurrentUser && (
                <View style={styles.avatarContainer}>
                  <UserAvatar
                    size={36}
                    name={userPseudo}
                    userId={userId}
                  />
                </View>
              )}
              
              <View style={styles.messageContentContainer}>
                <View 
                  style={[
                    styles.messageBubble,
                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                  ]}
                >                  <Text style={[
                    styles.messageText,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText
                  ]}>
                    {item.body}
                  </Text>
                  <View style={styles.messageFooter}>
                    {item.edited && (
                      <Text style={[
                        styles.editedText,
                        isCurrentUser ? styles.currentUserEdited : styles.otherUserEdited
                      ]}>
                        edited
                      </Text>
                    )}
                    <Text style={[
                      styles.timestampText,
                      isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
                    ]}>
                      {formatTimestamp(item.timestamp)}
                    </Text>
                  </View>
                </View>
                
                {isCurrentUser && (
                  <TouchableOpacity 
                    style={styles.messageMenuButton}
                    onPress={() => handleMessageOptions(item)}
                  >
                    <MaterialCommunityIcons name="dots-vertical" size={20} color="#8E97A9" />
                  </TouchableOpacity>
                )}
              </View>
              
              {isCurrentUser && (
                <View style={styles.avatarContainer}>
                  <UserAvatar
                    size={36}
                    name={currentUserPseudo}
                    userId={currentUserId}
                  />
                </View>
              )}
            </View>
          );
        }}
        inverted={false} // Changed to false to show oldest messages at the top
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.emojiButton} 
          onPress={toggleEmojiPicker}
        >
          <MaterialCommunityIcons name="emoticon-outline" size={24} color="#7B9CFF" />
        </TouchableOpacity>
        <TextInput          ref={inputRef}
          style={styles.input}
          value={msg}
          onChangeText={(text) => {
            setMsg(text);
            // Set typing status for the current user
            const ref_unediscussion_typing_current = ref_lesdiscussions.child(idDesc);
            ref_unediscussion_typing_current.child(`${currentUserId}_isTyping`).set(text.length > 0);
          }}
          placeholder={editingMessage ? "Edit message..." : "Type a message"}
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
        {/* Emoji Picker Component */}
      <EmojiPicker
        onEmojiSelected={handleEmojiSelect}
        open={isEmojiPickerVisible}
        onClose={() => setIsEmojiPickerVisible(false)}
        theme={{
          backdrop: 'rgba(0, 0, 0, 0.1)',
          knob: '#7B9CFF',
          container: '#F8F9FB',
          header: '#FFFFFF',
          skinToneButton: '#7B9CFF',
        }}
        categoryPosition="top"
        enableRecentlyUsed
        enableSearchBar
      />
      
      {/* Message Options Modal */}
      <Modal
        visible={messageMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMessageMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMessageMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={startEditingMessage}
            >
              <MaterialCommunityIcons name="pencil" size={22} color="#7B9CFF" />
              <Text style={styles.modalOptionText}>Edit Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, styles.deleteOption]}
              onPress={deleteMessage}
            >
              <MaterialCommunityIcons name="delete" size={22} color="#FF7E87" />
              <Text style={[styles.modalOptionText, styles.deleteText]}>Delete Message</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F8F9FB',
  },
  messagesContent: {
    paddingBottom: 10,
    paddingTop: 10,
  },
  typingText: {
    fontStyle: 'italic',
    color: '#7B9CFF',
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  editingContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123, 156, 255, 0.12)',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editingText: {
    color: '#7B9CFF',
    fontWeight: '600',
    flex: 1,
  },
  cancelEditButton: {
    padding: 5,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingHorizontal: 6,
    width: '100%',
  },
  messageContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '70%',
  },
  messageMenuButton: {
    marginLeft: 4,
    padding: 4,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  currentUserRow: {
    justifyContent: 'flex-end',
  },
  otherUserRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 18,
    marginBottom: 6,
    borderRadius: 26,
    maxWidth: '70%',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  currentUserMessage: {
    backgroundColor: '#7B9CFF',
    borderBottomRightRadius: 0,
  },
  otherUserMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#2E3A59',
  },  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  editedText: {
    fontSize: 10,
    marginRight: 5,
    fontStyle: 'italic',
  },
  currentUserEdited: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  otherUserEdited: {
    color: '#8E97A9',
  },
  timestampText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTimestamp: {
    color: '#8E97A9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2E3A59',
    marginLeft: 10,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  deleteText: {
    color: '#FF7E87',
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
  },  sendButton: {
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
  emojiButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
});