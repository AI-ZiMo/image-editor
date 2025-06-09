"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Wand2, Image as ImageIcon, Palette, ArrowRight, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp, Loader2, Smartphone, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { pricingPlans, type PricingPlan } from "@/lib/pricing-data"
import { after } from "node:test"
import { styleText } from "util"

export default function HomePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setCurrentUser(data.user)
    }
    checkUser()
  }, [])

  // 图片对比数据
  const imageComparisons = [
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E5%8E%9F%E5%9B%BE_bdc4fdd7-530d-4a52-b19b-17935895a245.jpg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E5%9B%BE%E7%89%87%20(6).png",
      prompt: "增加温暖的光线效果"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesIMG_E487C4EC4ADF-1.jpeg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(8).jpg",
      prompt: "给图片上色"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesIMG_3D6CE39DEEC5-1.jpeg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(9).jpg",
      prompt: "将Fractal Haze 两个词 替换成 AI ZIMO"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesIMG_57FA6F951C96-1.jpeg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(11).jpg",
      prompt: "去除水印，尽量保持背景自然不变"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesIMG_9333F27C78FE-1.jpeg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E5%8E%86%E5%8F%B2%E5%9B%BE%E7%89%87%20(1).jpg",
      prompt: "将标志文字转变为闪烁的金属材质，漂浮在一片布满花朵的草地上"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesSnipaste_2025-06-09_17-06-07.jpg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(13).jpg",
      prompt: "只保留中心人物，去除背景中的路人，保证背景一致性"
    }
  ]

  // 风格对比数据
  const styleComparisons = [
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E4%B8%8B%E8%BD%BD%20(3).jpeg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(4).jpg",
      style: "老照片上色",
      tag: "修复"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesSnipaste_2025-06-08_17-08-56.jpg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(6).jpg",
      style: "贴纸风格",
      tag: "创意"
    },
    {
      before: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesIMG_80DB0820EEEA-1.jpeg",
      after: "https://aibuilder.oss-cn-hangzhou.aliyuncs.com/images%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%871%20(10).jpg",
      style: "吉卜力风格",
      tag: '动漫'
    }
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedComparison, setSelectedComparison] = useState<{
    type: 'prompt' | 'style',
    data: any
  } | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [galleryOffset, setGalleryOffset] = useState(0)
  const [isGalleryPaused, setIsGalleryPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartOffset, setDragStartOffset] = useState(0)
  const [isManualControl, setIsManualControl] = useState(false)

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imageComparisons.length)
    }, 4000) // 每4秒切换一次

    return () => clearInterval(interval)
  }, [imageComparisons.length])

  // 全局鼠标事件处理（用于拖拽）
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX)
    }

    const handleGlobalMouseUp = () => {
      handleDragEnd()
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragStartX, dragStartOffset, galleryOffset])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageComparisons.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageComparisons.length) % imageComparisons.length)
  }

  // 打开全屏模态框
  const openModal = (type: 'prompt' | 'style', data: any) => {
    setSelectedComparison({ type, data })
    setIsModalOpen(true)
  }

  // 关闭全屏模态框
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedComparison(null)
  }

  // 切换FAQ展开状态
  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  // 画廊左右滑动控制
  const slideGalleryLeft = () => {
    setIsManualControl(true)
    setGalleryOffset(prev => Math.min(prev + 400, 0))
    setIsGalleryPaused(true)
    setTimeout(() => {
      setIsGalleryPaused(false)
      setIsManualControl(false)
    }, 3000) // 3秒后恢复自动轮播
  }

  const slideGalleryRight = () => {
    setIsManualControl(true)
    setGalleryOffset(prev => prev - 400)
    setIsGalleryPaused(true)
    setTimeout(() => {
      setIsGalleryPaused(false)
      setIsManualControl(false)
    }, 3000) // 3秒后恢复自动轮播
  }

  // 拖拽事件处理
  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setIsManualControl(true)
    setDragStartX(clientX)
    setDragStartOffset(galleryOffset)
    setIsGalleryPaused(true)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    const deltaX = clientX - dragStartX
    setGalleryOffset(dragStartOffset + deltaX)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setTimeout(() => {
      setIsGalleryPaused(false)
      setIsManualControl(false)
    }, 3000) // 3秒后恢复自动轮播
  }

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // 处理套餐选择
  const handlePlanSelect = (plan: PricingPlan) => {
    if (!currentUser) {
      // 未登录用户跳转到登录页面
      router.push('/login')
      return
    }
    setSelectedPlan(plan)
  }

  // 处理支付
  const handlePurchase = async (plan: PricingPlan) => {
    setIsPaymentLoading(true)
    
    try {
      const response = await fetch('/api/payment/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: plan.credits,
          amount: plan.price,
          paymentType: 'wxpay',
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
      setIsPaymentLoading(false)
    }
  }

  // 处理定价按钮点击
  const handlePricingClick = () => {
    if (currentUser) {
      // 已登录用户跳转到定价页面
      router.push('/pricing')
    } else {
      // 未登录用户跳转到登录页面
      router.push('/login')
    }
  }

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
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes scroll-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-horizontal {
          animation: scroll-horizontal 30s linear infinite;
        }
        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
        .animate-scroll-horizontal.paused {
          animation-play-state: paused;
        }
        .manual-control {
          animation: none !important;
        }
        .gallery-container {
          cursor: grab;
        }
        .gallery-container.dragging {
          cursor: grabbing;
          user-select: none;
        }
      `}</style>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
              <div className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-purple-600">
                  替代PS的AI图片编辑工具
              </span>
            </h1>
            
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                采用最先进的图片大模型，保持图片一致性，拥有顶级的AI图片编辑体验
            </p>
            

              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
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

            {/* Right Content - Before/After Comparison Carousel */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white md:bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white md:bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex items-center justify-center space-x-4 mb-6">
                  {/* Before Image */}
                  <div className="relative">
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                      <Image
                        src={imageComparisons[currentImageIndex].before}
                        alt="转换前图片"
                        width={200}
                        height={356}
                        className="w-50 h-89 object-contain rounded-lg transition-all duration-500"
                        style={{ aspectRatio: '9/16' }}
                      />
                      <div className="absolute top-5 left-5 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                        转换前
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="bg-purple-600 text-white p-2 rounded-full">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* After Image */}
                  <div className="relative">
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                      <Image
                        src={imageComparisons[currentImageIndex].after}
                        alt="转换后图片"
                        width={200}
                        height={356}
                        className="w-50 h-89 object-contain rounded-lg transition-all duration-500"
                        style={{ aspectRatio: '9/16' }}
                      />
                      <div className="absolute top-5 left-5 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        AI编辑后
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex justify-center space-x-2 mb-4">
                  {imageComparisons.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-purple-600 w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Prompt Example */}
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-purple-700">
                  <Wand2 className="h-5 w-5" />
                  <span className="font-semibold">提示词示例："{imageComparisons[currentImageIndex].prompt}"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decorations - Reduced opacity on mobile for better readability */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 md:opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-200 rounded-full opacity-20 md:opacity-50 animate-pulse delay-1000"></div>
      </section>

      {/* AI Effects Showcase */}
      <section className="py-16 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              海量AI编辑效果
            </h2>
            <p className="text-xl text-gray-600">
              一键应用，让您的图片呈现无限可能
            </p>
          </div>
          
                    {/* Full-Screen Image Gallery */}
          <div className="relative" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
            {/* Navigation Buttons */}
            <button
              onClick={slideGalleryLeft}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            
            <button
              onClick={slideGalleryRight}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>

            {/* Animated container with manual control */}
            <div 
              className={`gallery-container ${isManualControl ? 'manual-control' : 'animate-scroll-horizontal'} ${isGalleryPaused && !isManualControl ? 'paused' : ''} ${isDragging ? 'dragging' : ''}`} 
              style={{ 
                position: 'relative',
                transform: isManualControl ? `translateX(${galleryOffset}px)` : undefined,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Display all real data in multiple rows */}
              <div className="space-y-4" style={{ width: '200%' }}>
                {(() => {
                  // Combine all images into one array
                  const allImages = [
                    ...imageComparisons.map((comparison, index) => ({
                      type: 'prompt',
                      data: comparison,
                      index
                    })),
                    ...styleComparisons.map((styleComparison, index) => ({
                      type: 'style',
                      data: styleComparison,
                      index
                    }))
                  ]
                  
                  // Split into rows of 6 images each
                  const itemsPerRow = 6
                  const rows = []
                  for (let i = 0; i < allImages.length; i += itemsPerRow) {
                    rows.push(allImages.slice(i, i + itemsPerRow))
                  }
                  
                  return rows.map((row, rowIndex) => (
                    <div 
                      key={rowIndex}
                      className={`flex gap-2 ${rowIndex % 2 === 1 ? 'ml-40' : ''}`}
                    >
                      {row.map((item, colIndex) => {
                                                 if (item.type === 'prompt') {
                           const comparison = item.data as typeof imageComparisons[0]
                          return (
                            <div
                              key={`prompt-${item.index}`}
                              className="flex-shrink-0 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer hover:z-10 relative border-2 border-purple-200"
                              style={{ 
                                width: '400px',
                                height: '320px'
                              }}
                              onClick={() => openModal('prompt', comparison)}
                            >
                              <div className="p-4 h-full flex flex-col">
                                {/* 前后对比图片 */}
                                <div className="flex gap-3 h-64">
                                  <div className="flex-1 relative">
                                    <Image
                                      src={comparison.before}
                                      alt="编辑前"
                                      width={180}
                                      height={320}
                                      className="w-full h-full object-contain rounded-lg"
                                      style={{ aspectRatio: '9/16' }}
                                    />
                                    <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                                      编辑前
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="bg-purple-600 text-white p-1 rounded-full">
                                      <ArrowRight className="h-3 w-3" />
                                    </div>
                                  </div>
                                  <div className="flex-1 relative">
                                    <Image
                                      src={comparison.after}
                                      alt="编辑后"
                                      width={180}
                                      height={320}
                                      className="w-full h-full object-contain rounded-lg"
                                      style={{ aspectRatio: '9/16' }}
                                    />
                                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                                      AI编辑后
                                    </div>
                                  </div>
                                </div>
                                {/* 提示词 */}
                                <div className="bg-purple-50 rounded-lg p-2">
                                  <p className="text-xs text-purple-700 font-medium text-center">
                                    提示词编辑："{comparison.prompt}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                                                 } else {
                           const styleComparison = item.data as typeof styleComparisons[0]
                          return (
                            <div
                              key={`style-${item.index}`}
                              className="flex-shrink-0 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer hover:z-10 relative border-2 border-blue-200"
                              style={{ 
                                width: '380px',
                                height: '320px'
                              }}
                              onClick={() => openModal('style', styleComparison)}
                            >
                              <div className="p-4 h-full flex flex-col">
                                {/* 风格对比图片 */}
                                <div className="flex gap-3 h-64">
                                  <div className="flex-1 relative">
                                    <Image
                                      src={styleComparison.before}
                                      alt="原图"
                                      width={170}
                                      height={302}
                                      className="w-full h-full object-contain rounded-lg"
                                      style={{ aspectRatio: '9/16' }}
                                    />
                                    <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                                      原图
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="bg-blue-600 text-white p-1 rounded-full">
                                      <ArrowRight className="h-3 w-3" />
                                    </div>
                                  </div>
                                  <div className="flex-1 relative">
                                    <Image
                                      src={styleComparison.after}
                                      alt="风格转换后"
                                      width={170}
                                      height={302}
                                      className="w-full h-full object-contain rounded-lg"
                                      style={{ aspectRatio: '9/16' }}
                                    />
                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                      {styleComparison.tag}
                                    </div>
                                  </div>
                                </div>
                                {/* 风格标题 */}
                                <div className="bg-blue-50 rounded-lg p-2">
                                  <p className="text-sm text-blue-700 font-semibold text-center">
                                    {styleComparison.style}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      })}
                    </div>
                  ))
                })()}
              </div>
            </div>
            
            {/* Gallery Controls Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div className="text-xs text-gray-600">
                {isDragging ? '拖拽中...' : '左右滑动或拖拽查看更多'}
              </div>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      Math.abs(galleryOffset / 400) === index 
                        ? 'bg-purple-600 w-4' 
                        : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Screen-edge gradients - funnel effect with 100% invisible at edges - Hidden on mobile for better readability */}
            <div 
              className="hidden md:block fixed left-0 top-0 h-screen pointer-events-none z-20" 
              style={{ 
                width: '300px',
                background: 'linear-gradient(to right, white 0%, white 20%, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0.2) 85%, transparent 100%)'
              }}
            ></div>
            <div 
              className="hidden md:block fixed right-0 top-0 h-screen pointer-events-none z-20" 
              style={{ 
                width: '300px',
                background: 'linear-gradient(to left, white 0%, white 20%, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0.2) 85%, transparent 100%)'
              }}
            ></div>
          </div>
        </div>
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              强大的AI图片编辑能力
            </h2>
            <p className="text-xl text-gray-600">
              运用最新的人工智能技术，为您提供专业级的图片编辑服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-purple-100 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wand2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">文字提示编辑</h3>
              <p className="text-gray-600">输入简单文字描述，AI就能为图片添加您想要的元素</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-green-100 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">智能融合</h3>
              <p className="text-gray-600">AI智能分析图片内容，完美融合新元素，效果自然逼真</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-blue-100 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">高质量输出</h3>
              <p className="text-gray-600">保持原图质量，生成高分辨率的编辑结果</p>
            </div>
          </div>

          {/* AI项目应用展示 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI图像生成项目案例</h3>
              <p className="text-gray-600">我们的AI技术已成功应用于多个领域，为用户提供专业的图像处理解决方案</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                "封面缩略图设计", "营销海报生成", "人物画像风格转换", "老照片修复上色", "艺术照片生成",
                "产品图片美化", "社交媒体配图", "证件照片优化", "品牌Logo设计", "电商主图制作"
              ].map((project, index) => (
                <div key={index} className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-sm font-medium text-purple-700">{project}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "50,000+", label: "处理图片数量", color: "purple" },
              { number: "10,000+", label: "活跃用户", color: "blue" },
              { number: "95%", label: "用户满意度", color: "green" },
              { number: "30s", label: "平均处理时间", color: "orange" }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  'text-orange-600'
                }`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              用户真实评价
            </h2>
            <p className="text-xl text-gray-600">
              听听专业用户如何评价我们的AI图片编辑工具
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "李设计师",
                role: "UI/UX 设计师",
                company: "互联网公司",
                content: "AI编辑大大提高了我的图片处理效率，原本需要几小时的PS工作，现在几分钟就能完成，而且效果非常自然。",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=designer&backgroundColor=b6e3f4,c0aede,d1d4f9"
              },
              {
                name: "王摄影师",
                role: "商业摄影师",
                company: "摄影工作室",
                content: "特别喜欢风格转换功能，能快速为客户提供多种风格的样片，客户满意度大幅提升，工作效率翻倍。",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=photographer&backgroundColor=ffd5dc,ffdfbf,c0aede"
              },
              {
                name: "张运营",
                role: "新媒体运营",
                company: "电商平台",
                content: "作为运营人员，经常需要快速制作各种风格的营销图片，这个工具让我能够独立完成大部分图片设计工作。",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marketing&backgroundColor=d1d4f9,ffd5dc,b6e3f4"
              }
            ].map((review, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-600">{review.role}</p>
                    <p className="text-xs text-gray-500">{review.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  "{review.content}"
                </p>
                <div className="flex mt-4">
                  {[1,2,3,4,5].map((star) => (
                    <Sparkles key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                积分定价
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              充值积分，开始你的AI图片创作之旅。充值越多，优惠力度越大
            </p>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-purple-700">
                <Sparkles className="h-5 w-5 fill-current" />
                <span className="font-semibold">每次编辑消耗 1 个积分 • 积分永不过期 • 充多少用多少</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.credits} 
                className={`relative border-2 rounded-2xl p-6 ${
                  plan.popular 
                    ? 'border-purple-500 shadow-xl scale-105 bg-purple-50' 
                    : 'border-gray-200 shadow-sm hover:shadow-md bg-white'
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
                
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  
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
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span>可编辑 {plan.credits} 张图片</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span>积分永不过期</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span>高质量AI处理</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-gray-800 hover:bg-gray-900'
                    } transition-colors duration-200`}
                  >
                    选择此套餐
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* More Pricing Link */}
          <div className="text-center mt-12">
            <Button 
              onClick={handlePricingClick}
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              查看完整定价详情
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* FAQ Items */}
          <div className="space-y-4">
            {[
              {
                question: "可以试用吗？",
                answer: "可以！每个新用户注册后都可以获得 2 次免费的 AI 图片编辑生成机会，让您充分体验我们的产品功能和效果。试用完毕后，如果满意我们的服务，可以选择合适的积分套餐继续使用。",
                category: "试用体验"
              },
              {
                question: "网站是收费的吗？收费标准是什么？",
                answer: "是的，我们的网站采用积分制收费模式。由于网站调用先进的图片编辑大模型（如 FLUX），每次图片处理都会产生算力消耗成本。为了确保网站长期稳定运营并提供优质服务，我们采用合理的收费标准。新用户注册即可获得免费体验积分，后续可根据需要购买积分套餐。",
                category: "收费相关"
              },
              {
                question: "如何使用这个AI图片编辑工具？",
                answer: "使用非常简单，只需三个步骤：\n1. 上传您的原始图片（支持 JPG、PNG 等常见格式）\n2. 选择合适的图片输出比例（1:1、16:9、9:16 等）\n3. 输入您的编辑需求描述，或选择我们预设的热门风格模板\n\n系统会自动处理您的图片，通常在30-60秒内完成。",
                category: "使用方法"
              },
              {
                question: "支持二次编辑和批量处理吗？",
                answer: "当然支持！这是我们的核心优势之一：\n• 无限次二次编辑：可以在之前的编辑结果基础上继续修改\n• 编辑链管理：可以查看完整的编辑历史链条\n• 灵活删除：支持删除中间的编辑结果，保留您满意的版本\n• 项目管理：每个原图及其所有编辑版本构成一个项目，便于管理",
                category: "功能特色"
              },
              {
                question: "我的图片数据安全吗？",
                answer: "您的数据安全是我们的首要关注：\n• 所有图片均存储在安全的云端服务器\n• 采用企业级加密技术保护您的数据\n• 严格的访问控制，只有您能查看自己的图片\n• 定期备份，防止数据丢失\n• 遵循相关隐私保护法规\n\n我们承诺不会将您的图片用于任何商业用途或与第三方分享。",
                category: "隐私安全"
              }
            ].map((faq, index) => {
              const isExpanded = expandedFAQ === index
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* FAQ Header - 可点击 */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                          {faq.category}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* FAQ Content - 可展开折叠 */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* More FAQ Link */}
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                查看更多问题
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            准备好体验AI的魔法了吗？
          </h2>
          <p className="text-xl mb-8 text-gray-700">
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

              {/* 支付方式 */}
              <div>
                <h3 className="font-medium mb-3">支付方式</h3>
                <div className="flex items-center p-3 border-2 border-green-500 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                    <Smartphone className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">微信支付</span>
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1"
                  disabled={isPaymentLoading}
                >
                  取消
                </Button>
                <Button 
                  onClick={() => handlePurchase(selectedPlan)}
                  disabled={isPaymentLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isPaymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      创建订单中...
                    </>
                  ) : (
                    '立即支付'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">小猫AI图片编辑</span>
            </div>
            <p className="text-gray-400">
              © 2024 小猫AI图片编辑. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>

      {/* 全屏模态框 */}
      {isModalOpen && selectedComparison && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-6xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white md:bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>

            <div className="p-8">
              {selectedComparison.type === 'prompt' ? (
                // 提示词编辑全屏展示
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-center text-purple-700">
                    AI提示词编辑
                  </h3>
                  
                  <div className="flex gap-8 items-center">
                    {/* 原图 */}
                    <div className="flex-1">
                      <div className="relative">
                        <Image
                          src={selectedComparison.data.before}
                          alt="编辑前"
                          width={450}
                          height={800}
                          className="w-full max-h-[600px] object-contain rounded-xl border border-gray-200"
                          style={{ aspectRatio: '9/16' }}
                        />
                        <div className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full font-medium">
                          编辑前
                        </div>
                      </div>
                    </div>

                    {/* 箭头 */}
                    <div className="flex justify-center">
                      <div className="bg-purple-600 text-white p-4 rounded-full">
                        <ArrowRight className="h-8 w-8" />
                      </div>
                    </div>

                    {/* 编辑后 */}
                    <div className="flex-1">
                      <div className="relative">
                        <Image
                          src={selectedComparison.data.after}
                          alt="编辑后"
                          width={450}
                          height={800}
                          className="w-full max-h-[600px] object-contain rounded-xl border border-gray-200"
                          style={{ aspectRatio: '9/16' }}
                        />
                        <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-full font-medium">
                          AI编辑后
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 提示词 */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center space-x-3 text-purple-700">
                      <Wand2 className="h-6 w-6" />
                      <span className="text-xl font-semibold">
                        提示词："{selectedComparison.data.prompt}"
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // 风格转换全屏展示
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-center text-blue-700">
                    AI风格转换
                  </h3>
                  
                  <div className="flex gap-8 items-center">
                    {/* 原图 */}
                    <div className="flex-1">
                      <div className="relative">
                        <Image
                          src={selectedComparison.data.before}
                          alt="原图"
                          width={450}
                          height={800}
                          className="w-full max-h-[600px] object-contain rounded-xl border border-gray-200"
                          style={{ aspectRatio: '9/16' }}
                        />
                        <div className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full font-medium">
                          原图
                        </div>
                      </div>
                    </div>

                    {/* 箭头 */}
                    <div className="flex justify-center">
                      <div className="bg-blue-600 text-white p-4 rounded-full">
                        <ArrowRight className="h-8 w-8" />
                      </div>
                    </div>

                    {/* 风格转换后 */}
                    <div className="flex-1">
                      <div className="relative">
                        <Image
                          src={selectedComparison.data.after}
                          alt="风格转换后"
                          width={450}
                          height={800}
                          className="w-full max-h-[600px] object-contain rounded-xl border border-gray-200"
                          style={{ aspectRatio: '9/16' }}
                        />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-medium">
                          {selectedComparison.data.tag}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 风格标题 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center space-x-3 text-blue-700">
                      <Palette className="h-6 w-6" />
                      <span className="text-xl font-semibold">
                        {selectedComparison.data.style}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
