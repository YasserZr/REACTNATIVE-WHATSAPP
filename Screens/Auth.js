import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ImageBackground,
  BackHandler,
  Alert,
} from "react-native";
import { useState } from "react";
import firebase from "../config";
const auth = firebase.auth();

export default function Auth(props) {
  const [email, setEmail] = useState("yasserzrelli1@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");  // Added error state

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        const currentUserId = auth.currentUser.uid;
        props.navigation.navigate("Home",{currentUserId});
        
      })
      .catch((error) => {
        setError(error.message);  // Show error message
      });
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/wallpaper.jpg")}
    >
      <View style={styles.formContainer}>
        <Text style={styles.header}>Welcome</Text>

        {/* Displaying error message if any */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          value={email}
          onChangeText={(ch) => setEmail(ch)}
          style={styles.input}
          placeholder="Enter your Email"
          keyboardType="email-address"
        />
        <TextInput
          value={password}
          onChangeText={(ch) => setPassword(ch)}
          style={styles.input}
          placeholder="Enter your Password"
          secureTextEntry={true}
        />

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleExit}
            title="Exit"
            color="#FF7F7F"
          />
          <Button
            onPress={handleLogin}
            title="Connect"
            color="#417cf3"
          />
        </View>

        <Text
          onPress={() => {
            props.navigation.navigate("NewAccount");
          }}
          style={styles.signUpText}
        >
          Don't have an account?
        </Text>
      </View>

      <StatusBar style="light" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    width: 300,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
  },
  header: {
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
  errorText: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});
