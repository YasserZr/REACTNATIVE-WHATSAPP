import React from 'react';
import Auth from './Screens/Auth';
import NewAccount from './Screens/NewAccount';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Screens/Home';
import Chat from './Screens/Chat'; // Fixed component name
import Setting from './Screens/Home/Setting';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen 
          name="NewAccount" 
          component={NewAccount} 
          options={{ headerShown: true, headerTitle: "Back to Auth" }} 
        />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
