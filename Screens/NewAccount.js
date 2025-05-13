import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ImageBackground,
  BackHandler,
} from "react-native";
import firebase from "../config";
const auth = firebase.auth();

export default function NewAccount(props) {
  const [email, setemail] = useState();
  const [password, setpassword] = useState();
  const [confirmpassword, setconfirmpassword] = useState();

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/wallpaper.jpg")}
    >
      <View style={styles.authContainer}>
        <Text style={styles.headerText}>Create new Account</Text>
        <TextInput
          onChangeText={(ch) => {
            setemail(ch);
          }}
          style={styles.input}
          placeholder="Enter your Email"
        />
        <TextInput
          onChangeText={(ch) => {
            setpassword(ch);
          }}
          style={styles.input}
          placeholder="Enter your Password"
        />
        <TextInput
          onChangeText={(ch) => {
            setconfirmpassword(ch);
          }}
          style={styles.input}
          placeholder="Confirm your Password"
        />
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
              props.navigation.goBack();
            }}
            title="Back"
            color="#FF7F7F"
          />
          <Button
            onPress={() => {
              if (password === confirmpassword) {
                auth
                  .createUserWithEmailAndPassword(email, password)
                  .then(() => {
                    const currentUserId = auth.currentUser.uid;
                    props.navigation.replace("Setting",{currentUserId}); // Fixed navigation
                  })
                  .catch((err) => {
                    alert(err.message); // Improved error handling
                  });
              } else {
                alert("Passwords do not match");
              }
            }}
            title="Create"
            color="#417cf3"
          />
        </View>
        <Text style={styles.signUpText}>Don't have an Account?</Text>
      </View>
      <StatusBar style="light" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  authContainer: {
    width: 300,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "darkgray",
    marginBottom: 10,
  },
  input: {
    padding: 10,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
    margin: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
  },
  signUpText: {
    fontWeight: "bold",
    fontStyle: "italic",
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
});
