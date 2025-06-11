import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { RootStackParamList } from '../types'
import { AuthScreen } from '../screens/auth/AuthScreen'
import { TabNavigator } from './TabNavigator'
import { ImageEditorScreen } from '../screens/main/ImageEditorScreen'
import { ImageViewerScreen } from '../screens/main/ImageViewerScreen'
import { CreditsScreen } from '../screens/main/CreditsScreen'
import { supabase } from '../services/supabase'
import { Colors } from '../constants/Colors'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const RootNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Error checking session:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen
              name="Auth"
              options={{ title: '登录' }}
            >
              {() => <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ title: '主页' }}
              />
              <Stack.Screen
                name="ImageEditor"
                component={ImageEditorScreen}
                options={{
                  title: 'AI图片编辑',
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: Colors.surface,
                  },
                  headerTintColor: Colors.text,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen
                name="ImageViewer"
                component={ImageViewerScreen}
                options={{
                  title: '图片详情',
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: Colors.surface,
                  },
                  headerTintColor: Colors.text,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen
                name="Credits"
                component={CreditsScreen}
                options={{
                  title: '我的积分',
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: Colors.surface,
                  },
                  headerTintColor: Colors.text,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}