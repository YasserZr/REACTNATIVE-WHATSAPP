import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
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
        />        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
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
          >
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authContainer: {
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
  headerText: {
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
  },  signUpText: {
    fontWeight: 'bold',
    color: '#7B9CFF',
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
    textDecorationLine: 'underline',
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
  createButton: {
    backgroundColor: '#7B9CFF',
  },
  backButton: {
    backgroundColor: '#FF7E87',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
