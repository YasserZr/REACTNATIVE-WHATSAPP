import React, { useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../../config/index";
const auth = firebase.auth();
const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes=ref_database.child("ListComptes");

export default function Setting(props) {
  const currentUserId = props.route.params.currentUserId; // Get the current user ID from route params
  const [pseudo, setPseudo] = useState("");
  const [numero, setNumero] = useState();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text
          style={{
            fontSize: 32,
            color: "#11A",
            fontWeight: "bold",
          }}
        >
          Settings
        </Text>
        <Image
          source={require("../../assets/profile.jpg")}
          style={styles.profileImage}
        ></Image>
        <TextInput
          onChangeText={(ch) => {
            setPseudo(ch);
          }}
          style={styles.input}
          placeholderTextColor={"#888"}
          placeholder="Pseudo"
        ></TextInput>
        <TextInput
          onChangeText={(ch) => {
            setNumero(ch);
          }}
          style={styles.input}
          placeholderTextColor={"#888"}
          placeholder="Number"
        ></TextInput>
        <Button onPress={()=>{
          const key=ref_listcomptes.push().key;
          const ref_uncompte=ref_listcomptes.child(currentUserId);
          ref_uncompte.set({
            id: currentUserId,
            //image: require("../../assets/profile.jpg"),
            pseudo,
            numero
          })
        }} title="save"></Button>
        <Button onPress={() => {
          auth.signOut().then(() => {
            props.navigation.navigate("Auth");
          });
          
        }} title="Disconnect">

        </Button>
      </View>
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
  input: {
    color: '#222',
    borderWidth: 1.5,
    borderColor: '#e3e8f0',
    height: 52,
    width: '90%',
    backgroundColor: '#f4f6fb',
    marginBottom: 18,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#5c6bc0',
    marginBottom: 30,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#e3e8f0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
    width: '92%',
    marginBottom: 30,
    borderWidth: 0,
  },
});
