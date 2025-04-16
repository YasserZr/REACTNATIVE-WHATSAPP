import * as React from "react";
import { useState } from "react";
import { FlatList, View, Text, Image, ImageBackground, Linking, Platform, StyleSheet, TouchableHighlight } from "react-native";
import firebase from "../../config"
import { useEffect } from "react";
const database = firebase.database();
const ref_database = database.ref();
const ref_listComptes = ref_database.child("ListComptes");  // Reference to the "users" node in the database

export default function ListUsers(props) {
  const currentUserId =  props.route.params.currentUserId;  // Added props to the function
  const [data, setData] = useState([]);

  // recuperer les données
useEffect(() => { 
  ref_listComptes.on("value", (snapshot) => {
    const d = [];
    snapshot.array.forEach(un_compte => {
      if (un_compte.val().id != currentUserId);  // Skip the current user
      d.push(un_compte.val());  // Push each user's data into the array
    });  // Convert the object to an array
    setData(d);  // Update the state with the users data
  });
  return () => {
    ref_listComptes.off();  // Clean up the listener on unmount
   }
}, []);  // Empty dependency array to run only once on mount

  //ref_listComptes.once
  

  return (
    <ImageBackground
      source={require("../../assets/walpaper.jpg")}
      style={styles.container}
    >
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              borderColor: "white",
              borderWidth: 2,
              margin: 5,
              padding: 5,
              borderRadius: 5,
              alignItems: "center",
            }}
          >
            {/* Navigate to "Chat" when clicking on the profile image */}
            <TouchableHighlight onPress={() => props.navigation.navigate("Chat")}>
              <Image
                source={require("../../assets/profile.jpg")}
                style={{ width: 40, height: 50, marginRight: 10 }}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center", // align horizontally
    justifyContent: "center", // align vertically
  },
  text: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
});
