import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq7H8X50167px-f8PrqJFREjvxBHlcCeM",
  authDomain: "whatsapp-16104.firebaseapp.com",
  projectId: "whatsapp-16104",
  storageBucket: "whatsapp-16104.firebasestorage.app",
  messagingSenderId: "852617647337",
  appId: "1:852617647337:web:7636cf22f725388101cc78",
  measurementId: "G-5822RPQP8P"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;