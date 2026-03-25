import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SendScreen from '../screens/send/SendScreen';
import ReceiveScreen from '../screens/receive/ReceiveScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💼</Text>,
        }}
      />
      <Tab.Screen
        name="Send"
        component={SendScreen}
        options={{
          tabBarLabel: 'Send',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>↑</Text>,
        }}
      />
      <Tab.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{
          tabBarLabel: 'Receive',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>↓</Text>,
        }}
      />
    </Tab.Navigator>
  );
}