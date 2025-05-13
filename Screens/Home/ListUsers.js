import * as React from "react";
import { useState } from "react";
import { FlatList, View, Text, Image, Linking, Platform, StyleSheet, TouchableHighlight } from "react-native";
import firebase from "../../config"
import { useEffect } from "react";
const database = firebase.database();
const ref_database = database.ref();
const ref_listComptes = ref_database.child("ListComptes");  // Reference to the "users" node in the database

export default function ListUsers(props) {
  const currentUserId =  props.route?.params?.currentUserId;  // Safely access currentUserId
  const [data, setData] = useState([]);

  // recuperer les données
useEffect(() => {
  if (currentUserId === undefined) {
    console.warn("ListUsers: currentUserId is undefined. Ensure it's passed as a route parameter when navigating to this screen.");
    setData([]); // Clear data or set an appropriate state if currentUserId is missing
    return; // Do not proceed to fetch data if currentUserId is missing
  }

  const listener = ref_listComptes.on("value", (snapshot) => {
    const d = [];
    snapshot.forEach(un_compte => {
      const compteValue = un_compte.val();
      if (compteValue && compteValue.id !== currentUserId) {  // Check if compteValue exists before accessing id
        d.push(compteValue);
      }
    });
    setData(d);
  });

  return () => {
    ref_listComptes.off("value", listener);  // Clean up the specific listener
   };
}, [currentUserId]); // Add currentUserId to dependency array

  return (    
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View
            style={styles.userCard}
          >
            {/* Navigate to "Chat" when clicking on the profile image */}
            <TouchableHighlight 
              onPress={() => {
                // Ensure 'currentUserId' is available in ListUsers' scope
                // 'item.id' should be the ID of the user in the list you want to chat with
                if (currentUserId && item.id) {
                  props.navigation.navigate("Chat", { 
                    currentUserId: currentUserId, 
                    userId: item.id  // This is the ID of the user you are navigating to chat with
                    // If you passed item.pseudo before, you can still pass it:
                    // userPseudo: item.pseudo 
                  });
                } else {
                  console.error("ListUsers.js: Cannot navigate to Chat. Missing currentUserId or item.id.");
                  // Optionally, show an alert to the user
                }
              }}
            >
              <Image
                source={require("../../assets/profile.jpg")}
                style={styles.avatar}
              />
            </TouchableHighlight>
            
            {/* Displaying the user's pseudo */}
            <Text style={styles.text}>{item.pseudo}</Text>

            {/* Displaying the phone number and enabling call functionality */}
            <Text
              style={styles.text}
              onPress={() => {
                const phoneNumber = item.numero;
                if (Platform.OS === "android") {
                  Linking.openURL(`tel:${phoneNumber}`);
                } else {
                  Linking.openURL(`telprompt:${phoneNumber}`);
                }
              }}
            >
              {item.numero}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.pseudo}  // Added keyExtractor for better performance
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  text: {
    color: '#1a237e',
    fontSize: 19,
    marginLeft: 10,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    padding: 18,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#5c6bc0',
    backgroundColor: '#e3e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
