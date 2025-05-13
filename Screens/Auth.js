import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
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
    <View
      style={styles.container}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  formContainer: {
    width: 340,
    minHeight: 380,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    padding: 32,
    marginBottom: 30,
    borderWidth: 0,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 24,
    letterSpacing: 1,
  },
  input: {
    padding: 16,
    borderColor: '#e3e8f0',
    borderWidth: 1.5,
    borderRadius: 16,
    width: 250,
    margin: 12,
    backgroundColor: '#f4f6fb',
    color: '#222',
    fontSize: 17,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
    marginBottom: 12,
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#5c6bc0',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#e53935',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 16,
  },
});
