import React from 'react';
import Auth from './Screens/Auth';
import NewAccount from './Screens/NewAccount';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Screens/Home';
import Chat from './Screens/Chat';
import Setting from './Screens/Home/Setting';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, Alert } from 'react-native'; // Added Alert
import * as ImagePicker from 'expo-image-picker';
import firebase from './config'; // Import initialized Firebase from config/index.js

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator 
        initialRouteName="Auth"
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#F8F9FB' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen 
          name="NewAccount" 
          component={NewAccount} 
          options={{ 
            headerShown: true, 
            headerTitle: "Create Account",
            headerTitleStyle: {
              color: '#2E3A59',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTintColor: '#7B9CFF',
            headerStyle: {
              backgroundColor: '#FFFFFF',
              elevation: 5,
              shadowColor: '#7B9CFF',
              shadowOpacity: 0.08,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 4 },
            }
          }} 
        />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen 
          name="Setting" 
          component={Setting}
          options={{
            headerShown: true,
            headerTitle: "Profile Settings",
            headerTitleStyle: {
              color: '#2E3A59',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTintColor: '#7B9CFF',
            headerStyle: {
              backgroundColor: '#FFFFFF',
              elevation: 5,
              shadowColor: '#7B9CFF',
              shadowOpacity: 0.08,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 4 },
            }
          }}
        />
        <Stack.Screen 
          name="Chat" 
          component={Chat}
          options={({ navigation, route }) => { // Added route
            const currentUserId = route.params?.currentUserId;
            const userId = route.params?.userId;

            const selectChatBackground = async () => {
              if (!currentUserId || !userId) {
                Alert.alert("Error", "User information is missing. Cannot set background.");
                return;
              }
              const idDesc = currentUserId > userId ? currentUserId + userId : userId + currentUserId;

              let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (permissionResult.granted === false) {
                Alert.alert("Permission Required", "Photo library access is needed to choose a background!");
                return;
              }

              let pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.7,
              });

              if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
                const localUri = pickerResult.assets[0].uri;
                
                // IMPORTANT: For this to work for BOTH users, 'imageToSave' MUST be a remote URL
                // from a cloud storage service (e.g., Firebase Storage).
                // You would upload 'localUri' to cloud storage and get a downloadable URL.
                // The current code saves the local URI, which will only work on the current device.
                const imageToSave = localUri; 

                try {
                  const discussionRef = firebase.database().ref(`listes_discussionsGL1/${idDesc}`);
                  await discussionRef.child('backgroundUri').set(imageToSave);
                  Alert.alert(
                    "Background Updated", 
                    "Chat background will update. next time you open the chat.",
                  );
                } catch (error) {
                  console.error("Error saving background URI to Firebase: ", error);
                  Alert.alert("Error", "Could not save background preference.");
                }
              }
            };

            return {
              headerShown: true,
              headerTitle: "Message",
              headerTitleStyle: {
                color: '#2E3A59',
                fontWeight: 'bold',
                fontSize: 20,
              },
              headerTintColor: '#7B9CFF',
              headerStyle: {
                backgroundColor: '#FFFFFF',
                elevation: 5,
                shadowColor: '#7B9CFF',
                shadowOpacity: 0.08,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 4 },
              },
              headerRight: () => ( 
                <TouchableOpacity 
                  onPress={selectChatBackground} 
                  style={{ marginRight: 15 }}
                >
                  <Ionicons name="image-outline" size={24} color="#7B9CFF" />
                </TouchableOpacity>
              ),
            };
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
