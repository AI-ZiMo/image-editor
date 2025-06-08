"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Check, Star, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof pricingPlans[0] | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wxpay'>('alipay')
  const [isLoading, setIsLoading] = useState(false)

  const pricingPlans = [
    {
      credits: 10,
      price: 9.9,
      originalPrice: 12,
      pricePerCredit: 0.99,
      label: "入门包",
      description: "适合轻度使用",
      popular: false,
      badge: "热门"
    },
    {
      credits: 50,
      price: 39.9,
      originalPrice: 60,
      pricePerCredit: 0.8,
      label: "进阶包",
      description: "适合日常创作",
      popular: true,
      badge: "推荐"
    },
    {
      credits: 100,
      price: 69.9,
      originalPrice: 120,
      pricePerCredit: 0.7,
      label: "专业包",
      description: "适合深度使用",
      popular: false,
      badge: "超值"
    },
    {
      credits: 200,
      price: 129.9,
      originalPrice: 240,
      pricePerCredit: 0.65,
      label: "企业包",
      description: "适合大量创作",
      popular: false,
      badge: "最划算"
    },
  ]

  const handlePurchase = async (plan: typeof pricingPlans[0]) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/payment/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: plan.credits,
          amount: plan.price,
          paymentType: paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('创建支付订单失败')
      }

      const data = await response.json()
      
      if (data.paymentUrl) {
        // 跳转到支付页面
        window.location.href = data.paymentUrl
      } else {
        throw new Error(data.error || '获取支付链接失败')
      }
    } catch (error) {
      console.error('支付错误:', error)
      alert('创建支付订单失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg">
              <Sparkles className="h-12 w-12" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              积分定价
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            充值积分，开始你的AI图片创作之旅。充值越多，优惠力度越大
          </p>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-purple-700">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-semibold">每次编辑消耗 1 个积分 • 积分永不过期 • 充多少用多少</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={plan.credits} 
              className={`relative border-2 ${
                plan.popular 
                  ? 'border-purple-500 shadow-xl scale-105' 
                  : 'border-gray-200 shadow-sm hover:shadow-md'
              } transition-all duration-300 hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    推荐
                  </div>
                </div>
              )}

              {plan.badge && !plan.popular && (
                <div className="absolute -top-2 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded">
                  {plan.badge}
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">
                  {plan.label}
                </CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-sm text-gray-500 line-through">
                    原价 ¥{plan.originalPrice}
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    ¥{plan.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.credits} 个积分
                  </div>
                  <div className="text-xs text-purple-600 font-medium mt-1">
                    平均 ¥{plan.pricePerCredit}/积分
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>可编辑 {plan.credits} 张图片</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>积分永不过期</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>高质量AI处理</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-800 hover:bg-gray-900'
                  } transition-colors duration-200`}
                >
                  选择此套餐
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-xl text-center">
                  支付确认
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 订单信息 */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">套餐：</span>
                    <span className="font-semibold">{selectedPlan.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">积分：</span>
                    <span className="font-semibold">{selectedPlan.credits} 积分</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">金额：</span>
                    <span className="font-semibold text-xl text-purple-600">
                      ¥{selectedPlan.price}
                    </span>
                  </div>
                </div>

                {/* 支付方式选择 */}
                <div>
                  <h3 className="font-medium mb-3">选择支付方式</h3>
                  <div className="space-y-2">
                    <div
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'alipay'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setPaymentMethod('alipay')}
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">支付宝</span>
                    </div>
                    
                    <div
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'wxpay'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => setPaymentMethod('wxpay')}
                    >
                      <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                        <Smartphone className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">微信支付</span>
                    </div>
                  </div>
                </div>

                {/* 按钮 */}
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    取消
                  </Button>
                  <Button 
                    onClick={() => handlePurchase(selectedPlan)}
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? '创建订单中...' : '立即支付'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            积分使用说明
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">简单计费</h3>
              <p className="text-gray-600">每次AI编辑图片消耗1个积分，无隐藏费用</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">永不过期</h3>
              <p className="text-gray-600">积分永久有效，随时使用无时间限制</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">充值优惠</h3>
              <p className="text-gray-600">一次充值越多，单价越便宜，最低0.7元/张</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Link href="/protected">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              开始创作
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 