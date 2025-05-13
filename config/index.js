import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUhdGVtK5gcbsn_3dySxg0CpEPAHT9f10",
  authDomain: "whats-app-ca882.firebaseapp.com",
  projectId: "whats-app-ca882",
  storageBucket: "whats-app-ca882.firebasestorage.app",
  messagingSenderId: "1078795949043",
  appId: "1:1078795949043:web:9def7f7739d6323df63886",
  measurementId: "G-KHTXLNTQ40"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;