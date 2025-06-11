import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { TabParamList } from '../types'

// Import screens
import { HomeScreen } from '../screens/main/HomeScreen'
import { HistoryScreen } from '../screens/main/HistoryScreen'
import { ProfileScreen } from '../screens/main/ProfileScreen'

const Tab = createBottomTabNavigator<TabParamList>()

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else {
            iconName = 'home-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '首页',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: '历史',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '我的',
        }}
      />
    </Tab.Navigator>
  )
}