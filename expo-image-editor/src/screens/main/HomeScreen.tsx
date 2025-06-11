import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'
import Constants from 'expo-constants'

import { Colors } from '../../constants/Colors'
import { RootStackParamList } from '../../types'
import { pickImageFromLibrary, takePhoto, requestImagePermissions } from '../../utils/imageUtils'
import { aiService } from '../../services/aiService'
import { supabase } from '../../services/supabase'

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>

const { width } = Dimensions.get('window')

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [userCredits, setUserCredits] = useState<number>(0)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.email || user.phone || '用户')
      }

      // Get user credits
      const creditsData = await aiService.getUserCredits()
      if (creditsData) {
        setUserCredits(creditsData.credits)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleImageSelection = async (source: 'camera' | 'library') => {
    try {
      const permissions = await requestImagePermissions()
      
      if (source === 'camera' && !permissions.camera) {
        Alert.alert('权限不足', '需要相机权限才能拍照')
        return
      }
      
      if (source === 'library' && !permissions.mediaLibrary) {
        Alert.alert('权限不足', '需要相册权限才能选择图片')
        return
      }

      const imageAsset = source === 'camera' 
        ? await takePhoto()
        : await pickImageFromLibrary()

      if (imageAsset) {
        navigation.navigate('ImageEditor', { imageUri: imageAsset.uri })
      }
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '操作失败')
    }
  }

  const features = [
    {
      icon: 'brush-outline',
      title: 'AI图片编辑',
      description: '用文字描述编辑图片',
      color: Colors.primary,
    },
    {
      icon: 'color-palette-outline',
      title: '风格转换',
      description: '一键转换艺术风格',
      color: Colors.secondary,
    },
    {
      icon: 'sparkles-outline',
      title: '智能美化',
      description: 'AI自动优化图片',
      color: Colors.success,
    },
    {
      icon: 'image-outline',
      title: '高质量输出',
      description: '保持原图高清质量',
      color: Colors.warning,
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>你好，{userName}</Text>
            <Text style={styles.subtitle}>开始您的AI创作之旅</Text>
          </View>
          <View style={styles.creditsRow}>
            <TouchableOpacity
              style={styles.creditsContainer}
              onPress={() => navigation.navigate('Credits')}
            >
              <Ionicons name="diamond-outline" size={20} color={Colors.primary} />
              <Text style={styles.creditsText}>{userCredits}</Text>
            </TouchableOpacity>
            
            {/* 测试按钮 - 生产环境应该删除 */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={async () => {
                try {
                  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://localhost:3000'
                  const response = await fetch(`${API_BASE_URL}/api/add-test-credits`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                    },
                    body: JSON.stringify({ amount: 10 }),
                  })
                  const data = await response.json()
                  if (data.success) {
                    setUserCredits(data.totalCredits)
                    Alert.alert('成功', data.message)
                  }
                } catch (error) {
                  Alert.alert('错误', '添加积分失败')
                }
              }}
            >
              <Text style={styles.testButtonText}>+10</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Ionicons name="sparkles" size={48} color="white" />
            <Text style={styles.heroTitle}>AI图片编辑</Text>
            <Text style={styles.heroSubtitle}>替代PS的智能图片编辑工具</Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开始创作</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleImageSelection('camera')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <Text style={styles.actionText}>拍照编辑</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleImageSelection('library')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="images" size={24} color="white" />
              </View>
              <Text style={styles.actionText}>选择图片</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能特色</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>案例展示</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.examplesContainer}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.exampleCard}>
                  <View style={styles.exampleImagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.exampleText}>示例 {item}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 6,
  },
  testButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  examplesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  exampleCard: {
    width: 120,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  exampleImagePlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: Colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
})