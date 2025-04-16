import { View, Text } from 'react-native';
import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { MaterialCommunityIcons } from 'react-native-vector-icons'; // Add icon imports
import ListUsers from './Home/ListUsers';
import Forum from './Home/Forum';
import Setting from './Home/Setting';

const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const currentUserId = props.route.params.currentUserId; // Get the current user ID from route params
  return (
    <Tab.Navigator
      activeColor="#e91e63"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: '#694fad' }} // Customize the bottom tab bar color
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
        initialParams={{ currentUserId }} // Pass the current user ID to ListUsers
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
        initialParams={{ currentUserId }} // Pass the current user ID to Forum
      />
    </Tab.Navigator>
  );
}
