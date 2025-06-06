import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Check, Star } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const pricingPlans = [
    {
      credits: 1,
      price: 1,
      pricePerCredit: 1,
      label: "体验包",
      description: "适合初次尝试",
      popular: false,
    },
    {
      credits: 10,
      price: 9.5,
      pricePerCredit: 0.95,
      label: "入门包",
      description: "适合轻度使用",
      popular: false,
    },
    {
      credits: 30,
      price: 27,
      pricePerCredit: 0.9,
      label: "进阶包",
      description: "适合日常创作",
      popular: true,
    },
    {
      credits: 50,
      price: 40,
      pricePerCredit: 0.8,
      label: "专业包",
      description: "适合深度使用",
      popular: false,
    },
    {
      credits: 100,
      price: 70,
      pricePerCredit: 0.7,
      label: "企业包",
      description: "适合大量创作",
      popular: false,
    },
  ]

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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
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
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">
                  {plan.label}
                </CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    ¥{plan.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.credits} 个积分
                  </div>
                  <div className="text-xs text-purple-600 font-medium mt-1">
                    ¥{plan.pricePerCredit}/张
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
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-800 hover:bg-gray-900'
                  } transition-colors duration-200`}
                >
                  立即充值
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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