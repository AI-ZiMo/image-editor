import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Colors } from '../../constants/Colors'
import { RootStackParamList } from '../../types'
import { supabase } from '../../services/supabase'
import { aiService } from '../../services/aiService'

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const [user, setUser] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get user credits
      const creditsData = await aiService.getUserCredits()
      if (creditsData) {
        setUserCredits(creditsData.credits)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut()
            } catch (error) {
              Alert.alert('错误', '退出登录失败')
            }
          },
        },
      ]
    )
  }

  const menuItems = [
    {
      icon: 'diamond-outline',
      title: '我的积分',
      subtitle: `${userCredits} 积分`,
      onPress: () => navigation.navigate('Credits'),
      showArrow: true,
    },
    {
      icon: 'time-outline',
      title: '编辑历史',
      subtitle: '查看所有创作记录',
      onPress: () => navigation.navigate('History'),
      showArrow: true,
    },
    {
      icon: 'help-circle-outline',
      title: '帮助与支持',
      subtitle: '常见问题和使用指南',
      onPress: () => Alert.alert('帮助', '功能开发中...'),
      showArrow: true,
    },
    {
      icon: 'settings-outline',
      title: '设置',
      subtitle: '个人设置和偏好',
      onPress: () => Alert.alert('设置', '功能开发中...'),
      showArrow: true,
    },
    {
      icon: 'information-circle-outline',
      title: '关于我们',
      subtitle: '版本信息和开发团队',
      onPress: () => Alert.alert('关于', '小猫AI图片编辑 v1.0.0'),
      showArrow: true,
    },
  ]

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={Colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.email || user?.phone || '用户'}
              </Text>
              <Text style={styles.userSubtitle}>
                {user?.email ? '邮箱用户' : '手机用户'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="diamond" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{userCredits}</Text>
            <Text style={styles.statLabel}>剩余积分</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="images" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>编辑作品</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.success} />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>使用天数</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              {item.showArrow && (
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.signOutText}>退出登录</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>小猫AI图片编辑 v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 小猫AI. 保留所有权利.</Text>
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
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signOutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
})