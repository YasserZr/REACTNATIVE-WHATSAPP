import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
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
          <TouchableOpacity
            style={[styles.button, styles.exitButton]}
            onPress={handleExit}
          >
            <Text style={styles.buttonText}>Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  formContainer: {
    width: 340,
    minHeight: 380,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: '#fff',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 10,
    padding: 36,
    marginBottom: 30,
    borderWidth: 0,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  input: {
    padding: 18,
    borderColor: '#F0F2F5',
    borderWidth: 1.5,
    borderRadius: 18,
    width: 270,
    margin: 12,
    backgroundColor: '#F8F9FB',
    color: '#2E3A59',
    fontSize: 17,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#7B9CFF',
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
    textDecorationLine: 'underline',
  },  errorText: {
    color: '#FF7E87',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
  },
  connectButton: {
    backgroundColor: '#7B9CFF',
  },
  exitButton: {
    backgroundColor: '#FF7E87',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
