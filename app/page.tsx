import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Wand2, Image as ImageIcon, Palette, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const features = [
    {
      icon: <Wand2 className="h-8 w-8 text-purple-600" />,
      title: "智能风格转换",
      description: "使用AI技术，一键将您的照片转换为多种艺术风格，包括吉卜力、水彩、油画等。"
    },
    {
      icon: <Palette className="h-8 w-8 text-purple-600" />,
      title: "多样化预设",
      description: "提供丰富的预设风格选择，满足不同的创作需求，让您的图片焕然一新。"
    },
    {
      icon: <ImageIcon className="h-8 w-8 text-purple-600" />,
      title: "高质量输出",
      description: "支持高分辨率图片处理，保持原图质量的同时，呈现出色的艺术效果。"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                魔图工坊
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI驱动的图片风格转换平台，让您的照片瞬间变身艺术作品
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/protected">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  立即开始创作
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
                  了解更多
            </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-50 animate-pulse delay-500"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              强大的AI图片处理能力
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              运用最新的人工智能技术，为您提供专业级的图片风格转换服务
            </p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
                          </div>
                        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              看看AI的神奇魔法
            </h2>
            <p className="text-xl text-gray-600">
              一键转换，让您的照片呈现出不同的艺术风格
            </p>
                        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎨 多种艺术风格</h3>
                <p className="text-gray-600">支持吉卜力、水彩画、油画、赛博朋克等多种风格转换</p>
                      </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ 快速处理</h3>
                <p className="text-gray-600">基于先进的AI算法，几秒钟内完成图片风格转换</p>
                        </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 精准效果</h3>
                <p className="text-gray-600">保持原图主体特征，完美融合目标艺术风格</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                  alt="示例图片"
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  原图
                </div>
          </div>

              {/* Decorative arrow */}
              <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-purple-400" />
                          </div>
                    </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            准备好体验AI的魔法了吗？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            立即开始，让您的照片焕发全新的艺术光彩
          </p>
          <Link href="/protected">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              免费开始使用
              <Sparkles className="ml-2 h-5 w-5" />
              </Button>
          </Link>
            </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">魔图工坊</span>
            </div>
            <p className="text-gray-400">
              © 2024 魔图工坊. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
