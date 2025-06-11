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

import { Colors } from '../../constants/Colors'
import { aiService } from '../../services/aiService'

interface PricingPlan {
  credits: number
  price: number
  originalPrice: number
  label: string
  description: string
  popular?: boolean
  badge?: string
}

export const CreditsScreen: React.FC = () => {
  const [userCredits, setUserCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserCredits()
  }, [])

  const loadUserCredits = async () => {
    try {
      const creditsData = await aiService.getUserCredits()
      if (creditsData) {
        setUserCredits(creditsData.credits)
      }
    } catch (error) {
      console.error('Error loading user credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const pricingPlans: PricingPlan[] = [
    {
      credits: 10,
      price: 9.9,
      originalPrice: 19.8,
      label: '体验套餐',
      description: '适合新手试用',
    },
    {
      credits: 50,
      price: 39.9,
      originalPrice: 99,
      label: '标准套餐',
      description: '个人用户推荐',
      popular: true,
    },
    {
      credits: 100,
      price: 69.9,
      originalPrice: 198,
      label: '进阶套餐',
      description: '高频使用用户',
    },
    {
      credits: 300,
      price: 189.9,
      originalPrice: 594,
      label: '专业套餐',
      description: '商用或团队使用',
      badge: '最优惠',
    },
  ]

  const handlePurchase = (plan: PricingPlan) => {
    Alert.alert(
      '购买积分',
      `确定购买 ${plan.credits} 积分吗？\n价格：¥${plan.price}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '购买',
          onPress: () => {
            Alert.alert('提示', '支付功能开发中，敬请期待！')
          },
        },
      ]
    )
  }

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
        {/* Current Credits */}
        <View style={styles.currentCredits}>
          <View style={styles.creditsCard}>
            <Ionicons name="diamond" size={48} color={Colors.primary} />
            <Text style={styles.creditsAmount}>{userCredits}</Text>
            <Text style={styles.creditsLabel}>当前积分</Text>
          </View>
          
          <View style={styles.creditsInfo}>
            <Text style={styles.infoTitle}>积分说明</Text>
            <Text style={styles.infoText}>• 每次AI编辑消耗 1 个积分</Text>
            <Text style={styles.infoText}>• 积分永不过期</Text>
            <Text style={styles.infoText}>• 新用户注册送 2 积分</Text>
          </View>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>购买积分</Text>
          <Text style={styles.sectionSubtitle}>选择适合您的积分套餐</Text>

          <View style={styles.plansContainer}>
            {pricingPlans.map((plan, index) => (
              <View
                key={index}
                style={[
                  styles.planCard,
                  plan.popular && styles.popularPlan,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>推荐</Text>
                  </View>
                )}

                {plan.badge && !plan.popular && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>

                <View style={styles.planPricing}>
                  <Text style={styles.originalPrice}>原价 ¥{plan.originalPrice}</Text>
                  <Text style={styles.currentPrice}>¥{plan.price}</Text>
                  <Text style={styles.creditsAmount}>{plan.credits} 积分</Text>
                  <Text style={styles.pricePerCredit}>
                    平均 ¥{(plan.price / plan.credits).toFixed(2)}/积分
                  </Text>
                </View>

                <View style={styles.planFeatures}>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureText}>可编辑 {plan.credits} 张图片</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureText}>积分永不过期</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureText}>高质量AI处理</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    plan.popular && styles.popularButton,
                  ]}
                  onPress={() => handlePurchase(plan)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      plan.popular && styles.popularButtonText,
                    ]}
                  >
                    选择此套餐
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  currentCredits: {
    padding: 20,
  },
  creditsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  creditsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  creditsLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  creditsInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pricingSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  popularPlan: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}05`,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    marginBottom: 16,
  },
  planLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 4,
  },
  pricePerCredit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  purchaseButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  popularButtonText: {
    color: 'white',
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