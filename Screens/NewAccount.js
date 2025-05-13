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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authContainer: {
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
  headerText: {
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
});
