import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'
import { Colors } from '../../constants/Colors'

interface LoginScreenProps {
  onLoginSuccess: () => void
  onNavigateToSignUp: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
}) => {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('phone')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const sendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('错误', '请输入手机号')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      })

      if (error) {
        Alert.alert('错误', error.message)
      } else {
        setIsOtpSent(true)
        Alert.alert('成功', '验证码已发送到您的手机')
      }
    } catch (error) {
      Alert.alert('错误', '发送验证码失败')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('错误', '请输入验证码')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: 'sms',
      })

      if (error) {
        Alert.alert('错误', error.message)
      } else {
        onLoginSuccess()
      }
    } catch (error) {
      Alert.alert('错误', '验证码验证失败')
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('错误', '请输入邮箱和密码')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        Alert.alert('错误', error.message)
      } else {
        onLoginSuccess()
      }
    } catch (error) {
      Alert.alert('错误', '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={32} color="white" />
            </View>
            <Text style={styles.title}>小猫AI图片编辑</Text>
            <Text style={styles.subtitle}>用AI让您的图片焕然一新</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.loginTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.loginTypeButton,
                  loginType === 'phone' && styles.loginTypeButtonActive,
                ]}
                onPress={() => setLoginType('phone')}
              >
                <Text
                  style={[
                    styles.loginTypeText,
                    loginType === 'phone' && styles.loginTypeTextActive,
                  ]}
                >
                  手机号登录
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.loginTypeButton,
                  loginType === 'email' && styles.loginTypeButtonActive,
                ]}
                onPress={() => setLoginType('email')}
              >
                <Text
                  style={[
                    styles.loginTypeText,
                    loginType === 'email' && styles.loginTypeTextActive,
                  ]}
                >
                  邮箱登录
                </Text>
              </TouchableOpacity>
            </View>

            {loginType === 'phone' ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="请输入手机号"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!isOtpSent}
                  />
                </View>

                {isOtpSent && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="shield-outline" size={20} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="请输入验证码"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={isOtpSent ? verifyOtp : sendOtp}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? '处理中...' : isOtpSent ? '验证登录' : '发送验证码'}
                  </Text>
                </TouchableOpacity>

                {isOtpSent && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setIsOtpSent(false)
                      setOtp('')
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>重新发送验证码</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="请输入邮箱"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="请输入密码"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={signInWithEmail}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? '登录中...' : '登录'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>还没有账号？</Text>
              <TouchableOpacity onPress={onNavigateToSignUp}>
                <Text style={styles.footerLink}>立即注册</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginTypeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  loginTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  loginTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  loginTypeTextActive: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
})