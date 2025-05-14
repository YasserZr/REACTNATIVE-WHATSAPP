import * as React from "react";
import { useState } from "react";
import { FlatList, View, Text, Image, Linking, Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import firebase from "../../config";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import UserAvatar from "../../components/UserAvatar";
import EmptyState from '../../components/EmptyState';
import { useEffect } from "react";
import { useMultipleUsersData } from "../../utils/userDataListener";
const database = firebase.database();
const ref_database = database.ref();
const ref_listComptes = ref_database.child("ListComptes");  // Reference to the "users" node in the database

export default function ListUsers(props) {
  const currentUserId =  props.route?.params?.currentUserId;  // Safely access currentUserId
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // recuperer les données
useEffect(() => {
  if (currentUserId === undefined) {
    console.warn("ListUsers: currentUserId is undefined. Ensure it's passed as a route parameter when navigating to this screen.");
    setData([]);
    setError("User ID not found. Cannot load contacts.");
    setLoading(false);
    return; // Do not proceed to fetch data if currentUserId is missing
  }

  setLoading(true);
  setError(null);

  const listener = ref_listComptes.on("value", (snapshot) => {
    const d = [];
    snapshot.forEach(un_compte => {
      const compteValue = un_compte.val();
      if (compteValue && compteValue.id !== currentUserId) {  // Check if compteValue exists before accessing id
        d.push(compteValue);
      }
    });
    setData(d);
    setLoading(false);
  }, (err) => {
    console.error("Firebase read error in ListUsers.js:", err);
    setError("Failed to load contacts. Please check your connection.");
    setLoading(false);
  });

  return () => {
    ref_listComptes.off("value", listener);  // Clean up the specific listener
   };
}, [currentUserId]); // Add currentUserId to dependency array// Show loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7B9CFF" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <EmptyState
        message={error}
        icon="alert-circle-outline"
      />
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contacts</Text>
        </View>
        <EmptyState
          message="No contacts found. Add some contacts to start chatting!"
          icon="account-multiple-outline"
        />
      </View>
    );
  }

  // Show contacts list
  return (    
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
      </View>
      <FlatList
        data={data}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            activeOpacity={0.7}
            onPress={() => {
              if (currentUserId && item.id) {
                props.navigation.navigate("Chat", { 
                  currentUserId: currentUserId, 
                  userId: item.id,
                  userPseudo: item.pseudo
                });
              } else {
                console.error("ListUsers.js: Cannot navigate to Chat. Missing currentUserId or item.id.");
              }
            }}
          >            <UserAvatar 
              source={item.profileImageUrl || null}
              userId={item.id}
              name={item.pseudo}
              size={65}
            />
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.pseudo}</Text>
              <Text style={styles.userNumber}>{item.numero}</Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  const phoneNumber = item.numero;
                  if (Platform.OS === "android") {
                    Linking.openURL(`tel:${phoneNumber}`);
                  } else {
                    Linking.openURL(`telprompt:${phoneNumber}`);
                  }
                }}
              >
                <MaterialCommunityIcons name="phone" size={22} color="#7B9CFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (currentUserId && item.id) {
                    props.navigation.navigate("Chat", { 
                      currentUserId: currentUserId, 
                      userId: item.id
                    });
                  }
                }}
              >
                <MaterialCommunityIcons name="chat" size={22} color="#7B9CFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (currentUserId && item.id) {
                    props.navigation.navigate("SendSms", { 
                      currentUserId: currentUserId, 
                      userId: item.id
                    });
                  }
                }}
              >
                <MaterialCommunityIcons name="sms" size={22} color="#7B9CFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.pseudo}
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
  centered: {
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
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginVertical: 12,
    marginHorizontal: 8,
    padding: 20,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 0,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: '#2E3A59',
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 4,
  },
  userNumber: {
    color: '#8E97A9',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
