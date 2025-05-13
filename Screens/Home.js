import { View, Text } from 'react-native';
import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { MaterialCommunityIcons } from 'react-native-vector-icons'; // Add icon imports
import ListUsers from './Home/ListUsers';
import Forum from './Home/Forum';
import Setting from './Home/Setting';

const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const currentUserId = props.route?.params?.currentUserId; // Safely get the current user ID

  // Optional: Add a check here if currentUserId is critical for Home screen's basic rendering
  if (currentUserId === undefined) {
    console.warn("Home.js: currentUserId is undefined. Ensure it's passed as a route parameter when navigating to the Home screen.");
    // You could return a loading/error view here if Home cannot function without currentUserId
    // For example:
    // return <View><Text>Loading or User ID missing...</Text></View>;
  }

  return (
    <Tab.Navigator
      activeColor="#7B9CFF"
      inactiveColor="#8E97A9"
      barStyle={{ backgroundColor: '#FFFFFF', elevation: 8, shadowColor: '#7B9CFF', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -2 }, shadowRadius: 10 }} // Updated to modern style
    >
      <Tab.Screen
        name="Users"
        component={ListUsers}
        options={{
          tabBarLabel: 'Users', // Custom label for tab
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={26} />
          ),
        }}
        initialParams={{ currentUserId }} // Pass the (potentially undefined) current user ID to ListUsers
      />
      <Tab.Screen
        name="Forum"
        component={Forum}
        options={{
          tabBarLabel: 'Forum',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="forum" color={color} size={26} />
          ),
        }}
        initialParams={{ currentUserId }} // Pass the current user ID to Forum
      />
      <Tab.Screen
        name="Settings"
        component={Setting}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="settings" color={color} size={26} />
          ),
        }}
        initialParams={{ currentUserId }} // Pass the (potentially undefined) current user ID to Setting
      />
    </Tab.Navigator>
  );
}
