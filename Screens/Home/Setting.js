import React, { useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
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
            fontSize: 36,
            color: "#2E3A59",
            fontWeight: "bold",
          }}
        >
          Settings
        </Text>
        <Image
          source={require("../../assets/profile.jpg")}
          style={styles.profileImage}
        />
        <TextInput
          onChangeText={(ch) => {
            setPseudo(ch);
          }}
          style={styles.input}
          placeholderTextColor={"#8E97A9"}
          placeholder="Pseudo"
        />
        <TextInput
          onChangeText={(ch) => {
            setNumero(ch);
          }}
          style={styles.input}
          placeholderTextColor={"#8E97A9"}
          placeholder="Number"
        />        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={()=>{
            const key=ref_listcomptes.push().key;
            const ref_uncompte=ref_listcomptes.child(currentUserId);
            ref_uncompte.set({
              id: currentUserId,
              //image: require("../../assets/profile.jpg"),
              pseudo,
              numero
            })
          }} 
        >
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.disconnectButton]} 
          onPress={() => {
            auth.signOut().then(() => {
              props.navigation.navigate("Auth");
            });
          }}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  input: {
    color: '#2E3A59',
    borderWidth: 1.5,
    borderColor: '#F0F2F5',
    height: 55,
    width: '92%',
    backgroundColor: '#F8F9FB',
    marginBottom: 20,
    borderRadius: 18,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
  },
  saveButton: {
    backgroundColor: '#7B9CFF',
    marginTop: 20,
  },
  disconnectButton: {
    backgroundColor: '#FF7E87',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: '#7B9CFF',
    marginBottom: 36,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#F0F2F5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 10,
    alignItems: 'center',
    width: '92%',
    marginBottom: 30,
    borderWidth: 0,
  },
});
