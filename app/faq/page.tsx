"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Search } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"

interface FAQItem {
  question: string
  answer: string
  category?: string
  tags?: string[]
}

const faqs: FAQItem[] = [
  {
    question: "网站是收费的吗？收费标准是什么？",
    answer: "是的，我们的网站采用积分制收费模式。由于网站调用先进的图片编辑大模型（如 FLUX），每次图片处理都会产生算力消耗成本。为了确保网站长期稳定运营并提供优质服务，我们采用合理的收费标准。新用户注册即可获得免费体验积分，后续可根据需要购买积分套餐。我们致力于提供物超所值的AI图片编辑服务。",
    category: "收费相关",
    tags: ["收费", "积分", "价格", "费用"]
  },
  {
    question: "如何使用这个AI图片编辑工具？",
    answer: "使用非常简单，只需三个步骤：\n1. 上传您的原始图片（支持 JPG、PNG 等常见格式）\n2. 选择合适的图片输出比例（1:1、16:9、9:16 等）\n3. 输入您的编辑需求描述，或选择我们预设的热门风格模板\n\n系统会自动处理您的图片，通常在30-60秒内完成。您可以在历史记录中查看所有编辑结果。",
    category: "使用方法",
    tags: ["使用", "操作", "上传", "编辑"]
  },
  {
    question: "支持二次编辑和批量处理吗？",
    answer: "当然支持！这是我们的核心优势之一：\n• 无限次二次编辑：可以在之前的编辑结果基础上继续修改\n• 编辑链管理：可以查看完整的编辑历史链条\n• 灵活删除：支持删除中间的编辑结果，保留您满意的版本\n• 项目管理：每个原图及其所有编辑版本构成一个项目，便于管理\n\n这让您可以不断完善作品，直到达到最理想的效果。",
    category: "功能特色",
    tags: ["二次编辑", "批量", "编辑链", "项目管理"]
  },
  {
    question: "支持哪些图片格式和尺寸？",
    answer: "我们支持主流的图片格式：\n• 输入格式：JPG、JPEG、PNG、WebP\n• 最大文件大小：10MB\n• 推荐分辨率：1024x1024 到 4096x4096\n• 输出比例：1:1（方形）、16:9（横屏）、9:16（竖屏）\n\n系统会自动优化图片质量，确保最佳的编辑效果。",
    category: "技术规格",
    tags: ["格式", "尺寸", "分辨率", "文件大小"]
  },
  {
    question: "图片处理需要多长时间？",
    answer: "处理时间取决于图片复杂度和当前服务器负载：\n• 一般情况：30-60秒\n• 复杂编辑：1-2分钟\n• 高峰期：可能稍有延迟\n\n我们使用最新的AI加速技术，确保为您提供快速、稳定的服务体验。处理完成后系统会自动通知您。",
    category: "服务质量",
    tags: ["处理时间", "速度", "性能", "效率"]
  },
  {
    question: "我的图片数据安全吗？",
    answer: "您的数据安全是我们的首要关注：\n• 所有图片均存储在安全的云端服务器\n• 采用企业级加密技术保护您的数据\n• 严格的访问控制，只有您能查看自己的图片\n• 定期备份，防止数据丢失\n• 遵循相关隐私保护法规\n\n我们承诺不会将您的图片用于任何商业用途或与第三方分享。",
    category: "隐私安全",
    tags: ["安全", "隐私", "数据保护", "加密"]
  },
  {
    question: "新用户有免费体验吗？",
    answer: "当然有！我们为新用户提供慷慨的免费体验：\n• 注册即送免费积分\n• 可以体验完整的AI图片编辑功能\n• 无功能限制，享受完整服务\n• 处理结果支持高清下载\n\n免费积分用完后，您可以根据需要购买更多积分继续使用。",
    category: "收费相关",
    tags: ["免费", "体验", "新用户", "注册送积分"]
  },
  {
    question: "支持手机使用吗？",
    answer: "完全支持！我们的网站采用响应式设计：\n• 自适应各种屏幕尺寸\n• 手机、平板、电脑都能完美使用\n• 触屏优化的操作界面\n• 移动端专门优化的上传体验\n\n无论您使用什么设备，都能享受流畅的AI图片编辑体验。",
    category: "技术规格",
    tags: ["手机", "移动端", "响应式", "跨平台"]
  }
]

const categories = ["全部", "收费相关", "使用方法", "功能特色", "技术规格", "服务质量", "隐私安全"]

export default function FAQPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === "" || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "全部" || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthButton={true} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HelpCircle className="h-8 w-8 mr-3 text-purple-600" />
                常见问题
              </h1>
              <p className="text-gray-600">快速找到您需要的答案</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div 
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'linear-gradient(to right, #9333ea, #2563eb)',
            minHeight: '160px'
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">有疑问？我们来帮您解答</h2>
          <p className="text-white leading-relaxed" style={{ opacity: 0.9 }}>
            以下是用户最关心的问题汇总，如果没有找到您要的答案，请联系我们的客服团队。
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索问题关键词..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <div className="flex items-center gap-2">
                        {faq.category && (
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                        )}
                        {faq.tags && faq.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                    )}
                  </div>
                </button>
                
                {expandedFAQ === index && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关问题</h3>
                <p className="text-gray-600 mb-4">
                  请尝试使用其他关键词搜索，或者选择不同的分类
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("全部")
                  }}
                >
                  清除筛选条件
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">还没找到答案？</h3>
          <p className="text-gray-600 mb-6">
            如果您还有其他疑问，欢迎联系我们的客服团队，我们会尽快为您解答
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700">
              联系客服
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">
                了解更多
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 