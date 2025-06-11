import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { LoginScreen } from './LoginScreen'
import { SignUpScreen } from './SignUpScreen'
import { supabase } from '../../services/supabase'

interface AuthScreenProps {
  onAuthSuccess: () => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        onAuthSuccess()
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onAuthSuccess()
      }
    })

    return () => subscription.unsubscribe()
  }, [onAuthSuccess])

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen
          onLoginSuccess={onAuthSuccess}
          onNavigateToSignUp={() => setIsLogin(false)}
        />
      ) : (
        <SignUpScreen
          onSignUpSuccess={onAuthSuccess}
          onNavigateToLogin={() => setIsLogin(true)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})