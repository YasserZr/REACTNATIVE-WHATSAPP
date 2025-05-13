import React from 'react';
import Auth from './Screens/Auth';
import NewAccount from './Screens/NewAccount';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Screens/Home';
import Chat from './Screens/Chat'; // Fixed component name
import Setting from './Screens/Home/Setting';
import { StatusBar } from 'expo-status-bar';

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
          options={{
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
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
