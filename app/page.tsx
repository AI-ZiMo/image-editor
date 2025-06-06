"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Sparkles, AlertCircle, Download, X, Maximize2, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageVersion {
  id: string
  url: string
  style?: string
  prompt?: string
  isOriginal?: boolean
}

const presetStyles = [
  { name: "吉卜力风格", value: "ghibli", description: "温馨手绘" },
  { name: "水晶球风格", value: "crystal-ball", description: "梦幻水晶" },
  { name: "水彩画风格", value: "watercolor", description: "柔和水彩" },
  { name: "油画风格", value: "oil-painting", description: "经典油画" },
  { name: "赛博朋克", value: "cyberpunk", description: "未来科技" },
  { name: "古典艺术", value: "classical-art", description: "古典艺术" },
  { name: "动漫风格", value: "anime", description: "日式动漫" },
  { name: "素描风格", value: "sketch", description: "铅笔素描" },
  { name: "卡通风格", value: "cartoon", description: "可爱卡通" },
]

const aspectRatios = [
  { name: "match_input_image", label: "匹配原图", value: "match", isDefault: true },
  { name: "1:1", label: "1:1", value: "1:1", description: "正方形" },
  { name: "16:9", label: "16:9", value: "16:9", description: "宽屏" },
  { name: "9:16", label: "9:16", value: "9:16", description: "竖屏" },
  { name: "4:3", label: "4:3", value: "4:3", description: "标准" },
  { name: "3:4", label: "3:4", value: "3:4", description: "竖版" },
]

// Unsplash图片ID数组，包含不同比例的图片
const unsplashImages = [
  // 横屏图片 (16:9 或类似比例)
  { id: "photo-1506905925346-21bda4d32df4", aspect: "landscape" }, // 山景
  { id: "photo-1518837695005-2083093ee35b", aspect: "landscape" }, // 海滩
  { id: "photo-1441974231531-c6227db76b6e", aspect: "landscape" }, // 森林
  { id: "photo-1470071459604-3b5ec3a7fe05", aspect: "landscape" }, // 星空
  { id: "photo-1501594907352-04cda38ebc29", aspect: "landscape" }, // 湖泊

  // 竖屏图片 (9:16 或类似比例)
  { id: "photo-1544005313-94ddf0286df2", aspect: "portrait" }, // 人像
  { id: "photo-1507003211169-0a1dd7228f2d", aspect: "portrait" }, // 人像
  { id: "photo-1494790108755-2616c9c0e8e0", aspect: "portrait" }, // 人像
  { id: "photo-1517841905240-472988babdf9", aspect: "portrait" }, // 人像
  { id: "photo-1524504388940-b1c1722653e1", aspect: "portrait" }, // 人像

  // 正方形图片 (1:1)
  { id: "photo-1469474968028-56623f02e42e", aspect: "square" }, // 自然
  { id: "photo-1506905925346-21bda4d32df4", aspect: "square" }, // 风景
]

export default function ImageEditor() {
  const [imageVersions, setImageVersions] = useState<ImageVersion[]>([])
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatios[0].value)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [generationMode, setGenerationMode] = useState<"style" | "prompt">("style")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const originalImage: ImageVersion = {
          id: `original-${Date.now()}`,
          url: e.target?.result as string,
          isOriginal: true,
        }
        setImageVersions([originalImage])
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateImageEdit = async (prompt: string, style?: string) => {
    if (imageVersions.length === 0) return

    setIsProcessing(true)

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 随机选择不同比例的图片
    const randomImage = unsplashImages[Math.floor(Math.random() * unsplashImages.length)]

    // 根据图片比例设置不同的尺寸参数
    let imageUrl = ""
    switch (randomImage.aspect) {
      case "portrait":
        // 竖屏图片 (9:16 比例)
        imageUrl = `https://images.unsplash.com/${randomImage.id}?w=600&h=800&fit=crop&v=${Date.now()}`
        break
      case "landscape":
        // 横屏图片 (16:9 比例)
        imageUrl = `https://images.unsplash.com/${randomImage.id}?w=800&h=600&fit=crop&v=${Date.now()}`
        break
      case "square":
        // 正方形图片 (1:1 比例)
        imageUrl = `https://images.unsplash.com/${randomImage.id}?w=800&h=800&fit=crop&v=${Date.now()}`
        break
      default:
        imageUrl = `https://images.unsplash.com/${randomImage.id}?w=800&h=600&fit=crop&v=${Date.now()}`
    }

    const newVersion: ImageVersion = {
      id: `generated-${Date.now()}`,
      url: imageUrl,
      style: style,
      prompt: style ? undefined : prompt,
    }

    setImageVersions((prev) => [...prev, newVersion])
    setCurrentPrompt("")
    setSelectedStyle(null)
    setIsProcessing(false)
  }

  const handlePromptSubmit = () => {
    if (imageVersions.length > 0 && currentPrompt.trim()) {
      simulateImageEdit(currentPrompt)
    }
  }

  const handleStyleClick = (styleValue: string) => {
    if (imageVersions.length > 0) {
      setSelectedStyle(styleValue)
      const style = presetStyles.find((s) => s.value === styleValue)
      if (style) {
        simulateImageEdit("", styleValue)
      }
    }
  }

  const handleAspectRatioClick = (ratioValue: string) => {
    setSelectedAspectRatio(ratioValue)
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsModalOpen(true)
  }

  const handleDownload = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${imageName}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("下载失败:", error)
    }
  }

  const latestImage = imageVersions[imageVersions.length - 1]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">魔图工坊</div>
                <div className="text-xs text-gray-500">AI图片风格转换</div>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                首页
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                关于我们
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                常见问题
              </a>
            </nav>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => fileInputRef.current?.click()}>
              开始创作
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery Section */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">上传图片</h3>
            </div>
            <div className="text-sm text-gray-500 mb-6">支持JPG、PNG等格式，建议图片大小不超过10MB</div>

            {/* Horizontal Scrolling Image Gallery */}
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {/* Upload Area or First Image */}
                {imageVersions.length === 0 ? (
                  <div
                    className="flex-shrink-0 w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-gray-500 text-center">
                      <div className="font-medium">点击上传图片</div>
                      <div className="text-sm mt-1">或拖拽图片到此处</div>
                    </div>
                  </div>
                ) : (
                  imageVersions.map((version, index) => (
                    <div key={version.id} className="flex-shrink-0 relative">
                      {/* Image Container with flexible height */}
                      <div className="w-64 min-h-64 max-h-80 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative group bg-gray-50 flex items-center justify-center p-2">
                        <div
                          className="relative w-full h-full flex items-center justify-center cursor-pointer"
                          onClick={() => handleImageClick(version.url)}
                        >
                          <Image
                            src={version.url || "/placeholder.svg"}
                            alt={version.isOriginal ? "原始图片" : `生成图片 ${index}`}
                            width={240}
                            height={240}
                            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8" />
                          </div>
                        </div>

                        {/* Image Label */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {version.isOriginal ? "原图" : `图片${index}`}
                        </div>

                        {/* Download Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(version.url, version.isOriginal ? "原图" : `生成图片${index}`)
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Latest Image Indicator */}
                      {index === imageVersions.length - 1 && !version.isOriginal && (
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          最新
                        </div>
                      )}

                      {/* Reselect Button for Original Image */}
                      {version.isOriginal && (
                        <div className="mt-3 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs"
                          >
                            点击重新选择图片
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex-shrink-0 w-64 h-64 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <div className="text-purple-600 text-center">
                      <div className="font-medium">正在生成</div>
                      <div className="text-sm mt-1">请稍候...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls Section - 4:6 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Aspect Ratio Selection - 4/10 width */}
          <div className="lg:col-span-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">生成图片比例</h3>
                <div className="text-sm text-gray-500 mb-4">选择输出图片的宽高比例</div>

                {imageVersions.length === 0 && (
                  <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>请先上传图片</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {aspectRatios.map((ratio) => (
                    <Button
                      key={ratio.value}
                      variant="outline"
                      onClick={() => handleAspectRatioClick(ratio.value)}
                      disabled={isProcessing || imageVersions.length === 0}
                      className={`h-auto p-3 text-center ${
                        selectedAspectRatio === ratio.value && imageVersions.length > 0
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-center">
                          {ratio.isDefault && <Check className="h-3 w-3 mr-1 text-green-600" />}
                          <span className="font-medium text-sm">{ratio.label}</span>
                        </div>
                        {ratio.description && <div className="text-xs text-gray-500 mt-1">{ratio.description}</div>}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generation Commands - 6/10 width */}
          <div className="lg:col-span-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">生成命令</h3>
                <div className="text-sm text-gray-500 mb-4">
                  {latestImage && !latestImage.isOriginal
                    ? `基于最新生成的图片进行修改`
                    : "选择预设风格或输入自定义提示词"}
                </div>

                {imageVersions.length === 0 && (
                  <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>请先上传图片，然后选择风格或输入提示词</AlertDescription>
                  </Alert>
                )}

                <Tabs value={generationMode} onValueChange={(value) => setGenerationMode(value as "style" | "prompt")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="style">预设风格</TabsTrigger>
                    <TabsTrigger value="prompt">自定义提示词</TabsTrigger>
                  </TabsList>

                  <TabsContent value="style" className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {presetStyles.map((style) => (
                        <Button
                          key={style.value}
                          variant="outline"
                          onClick={() => handleStyleClick(style.value)}
                          disabled={isProcessing || imageVersions.length === 0}
                          className={`h-auto p-3 text-center ${
                            selectedStyle === style.value && imageVersions.length > 0
                              ? "border-purple-600 bg-purple-50"
                              : ""
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm">{style.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="prompt" className="space-y-4">
                    <Textarea
                      placeholder="例如：将背景改为夕阳西下的海滩，增加温暖的光线效果..."
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      className="min-h-24"
                      disabled={isProcessing || imageVersions.length === 0}
                    />

                    <Button
                      onClick={handlePromptSubmit}
                      disabled={isProcessing || imageVersions.length === 0 || !currentPrompt.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          处理中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          开始魔法转换
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </main>

      {/* Full Screen Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-white">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">图片预览</h2>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => selectedImage && handleDownload(selectedImage, "图片")}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>下载</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
            {selectedImage && (
              <div className="relative max-w-full max-h-full">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="全屏图片"
                  width={1200}
                  height={900}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
