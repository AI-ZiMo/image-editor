"use client"

import { redirect } from "next/navigation";
import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Sparkles, AlertCircle, Download, X, Maximize2, Check } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { ImageModal } from "@/components/image-modal"
import { createClient } from "@/lib/supabase/client"

interface ImageVersion {
  id: string
  url: string
  style?: string
  prompt?: string
  isOriginal?: boolean
  replicateFileUrl?: string // For Replicate file URL or Supabase URL for editing
  supabaseFilePath?: string // For Supabase storage path
}

const presetStyles = [
  { name: "吉卜力风格", value: "Studio Ghibli style", description: "温馨手绘" },
  { name: "水彩画风格", value: "watercolor painting", description: "柔和水彩" },
  { name: "油画风格", value: "oil painting", description: "经典油画" },
  { name: "赛博朋克", value: "cyberpunk", description: "未来科技" },
  { name: "动漫风格", value: "anime style", description: "日式动漫" },
  { name: "素描风格", value: "pencil sketch", description: "铅笔素描" },
  { name: "梵高风格", value: "Van Gogh style", description: "印象派" },
  { name: "像素艺术", value: "pixel art", description: "8位像素" },
  { name: "黑白照片", value: "black and white photography", description: "经典黑白" },
]

const aspectRatios = [
  { name: "match_input_image", label: "匹配原图", value: "match", isDefault: true },
  { name: "1:1", label: "1:1", value: "1:1", description: "正方形" },
  { name: "16:9", label: "16:9", value: "16:9", description: "宽屏" },
  { name: "9:16", label: "9:16", value: "9:16", description: "竖屏" },
  { name: "4:3", label: "4:3", value: "4:3", description: "标准" },
  { name: "3:4", label: "3:4", value: "3:4", description: "竖版" },
]



export default function ImageEditor() {
  const router = useRouter()
  const [imageVersions, setImageVersions] = useState<ImageVersion[]>([])
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatios[0].value)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [generationMode, setGenerationMode] = useState<"style" | "prompt">("style")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 认证检查已移至服务器端layout.tsx，此处不再需要

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadSuccess(false)
      
      try {
        // Show local preview immediately
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

        // Upload to Replicate
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        
        const uploadResult = await uploadResponse.json()
        
        if (uploadResult.success) {
          // Update the original image with Supabase URLs
          setImageVersions(prev => prev.map(img => 
            img.isOriginal 
              ? { 
                  ...img, 
                  url: uploadResult.fileUrl, // Update display URL to Supabase
                  replicateFileUrl: uploadResult.fileUrl, // Use Supabase URL for editing
                  supabaseFilePath: uploadResult.filePath 
                }
              : img
          ))
          
          // 显示成功状态和toast
          setUploadSuccess(true)
          toast.success('图片上传成功！')
          
          // 2秒后隐藏成功状态
          setTimeout(() => {
            setUploadSuccess(false)
          }, 2000)
        } else {
          console.error('Upload failed:', uploadResult.error)
          toast.error('图片上传失败，请重试')
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('图片上传失败，请重试')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const editImageWithReplicate = async (prompt: string, style?: string) => {
    if (imageVersions.length === 0) return

    // Get the latest image to use as input (either original or last generated)
    const latestImage = imageVersions[imageVersions.length - 1]
    const inputImageUrl = latestImage.replicateFileUrl || latestImage.url

    if (!inputImageUrl) {
      console.error('No input image URL available')
      return
    }

    setIsProcessing(true)

    try {
      // Combine style and prompt if both exist
      const finalPrompt = style 
        ? `Apply ${style} style. ${prompt}`.trim()
        : prompt

      // Start image editing
      const editResponse = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputImage: inputImageUrl,
          prompt: finalPrompt,
          aspectRatio: selectedAspectRatio === "match" ? "match_input_image" : selectedAspectRatio,
        }),
      })

      const editResult = await editResponse.json()

      if (!editResult.success) {
        console.error('Edit failed:', editResult.error)
        setIsProcessing(false)
        return
      }

      // Poll for completion
      const predictionId = editResult.predictionId
      let attempts = 0
      const maxAttempts = 60 // 5 minutes with 5-second intervals

      const pollForResult = async (): Promise<void> => {
        try {
          const statusResponse = await fetch(`/api/check-prediction?id=${predictionId}`)
          const statusResult = await statusResponse.json()

                                if (statusResult.success) {
             if (statusResult.status === 'succeeded' && statusResult.output) {
               try {
                 // Store the generated image in Supabase
                 const storeResponse = await fetch('/api/store-generated-image', {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({
                     imageUrl: statusResult.output
                   }),
                 })

                 const storeResult = await storeResponse.json()

                                   if (storeResult.success) {
                    // Add the new generated image with Supabase URL
                    const newVersion: ImageVersion = {
                      id: `generated-${Date.now()}`,
                      url: storeResult.storedUrl, // Use Supabase URL for display
                      style: style,
                      prompt: style ? undefined : prompt,
                      replicateFileUrl: storeResult.storedUrl, // Store for future edits
                      supabaseFilePath: storeResult.filePath,
                    }

                   setImageVersions((prev) => [...prev, newVersion])
                 } else {
                   console.error('Failed to store image:', storeResult.error)
                   // Fallback to using Replicate URL directly
                   const newVersion: ImageVersion = {
                     id: `generated-${Date.now()}`,
                     url: statusResult.output,
                     style: style,
                     prompt: style ? undefined : prompt,
                     replicateFileUrl: statusResult.output,
                   }

                   setImageVersions((prev) => [...prev, newVersion])
                 }
               } catch (error) {
                 console.error('Error storing image:', error)
                 // Fallback to using Replicate URL directly
                 const newVersion: ImageVersion = {
                   id: `generated-${Date.now()}`,
                   url: statusResult.output,
                   style: style,
                   prompt: style ? undefined : prompt,
                   replicateFileUrl: statusResult.output,
                 }

                 setImageVersions((prev) => [...prev, newVersion])
               }

               setCurrentPrompt("")
               setSelectedStyle(null)
               setIsProcessing(false)
               return
            } else if (statusResult.status === 'failed') {
              console.error('Prediction failed:', statusResult.error)
              setIsProcessing(false)
              return
            } else if (statusResult.status === 'canceled') {
              console.error('Prediction was canceled')
              setIsProcessing(false)
              return
            }
          }

          // Continue polling if still processing
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(pollForResult, 5000) // Poll every 5 seconds
          } else {
            console.error('Polling timeout')
            setIsProcessing(false)
          }
        } catch (error) {
          console.error('Polling error:', error)
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(pollForResult, 5000)
          } else {
            setIsProcessing(false)
          }
        }
      }

      // Start polling
      setTimeout(pollForResult, 2000) // Initial delay

    } catch (error) {
      console.error('Image edit error:', error)
      setIsProcessing(false)
    }
  }

  const handlePromptSubmit = () => {
    if (imageVersions.length > 0 && currentPrompt.trim()) {
      editImageWithReplicate(currentPrompt)
    }
  }

  const handleStyleClick = (styleValue: string) => {
    if (imageVersions.length > 0) {
      setSelectedStyle(styleValue)
      const style = presetStyles.find((s) => s.value === styleValue)
      if (style) {
        editImageWithReplicate("", styleValue)
      }
    }
  }

  const handleAspectRatioClick = (ratioValue: string) => {
    setSelectedAspectRatio(ratioValue)
  }

  const handleImageClick = (imageUrl: string) => {
    const index = imageVersions.findIndex(version => version.url === imageUrl)
    setCurrentImageIndex(index >= 0 ? index : 0)
    setSelectedImage(imageUrl)
    setIsModalOpen(true)
  }

  const handleNavigate = (index: number) => {
    if (imageVersions[index]) {
      setCurrentImageIndex(index)
      setSelectedImage(imageVersions[index].url)
    }
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

  const handleDeleteConfirm = (deleteIndex: number) => {
    setImageToDelete(deleteIndex)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteFromIndex = () => {
    if (imageToDelete !== null) {
      // Remove only the specific image at the index
      setImageVersions(prev => prev.filter((_, index) => index !== imageToDelete))
      setDeleteConfirmOpen(false)
      setImageToDelete(null)
    }
  }

  const latestImage = imageVersions[imageVersions.length - 1]

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative group bg-gray-50 flex items-center justify-center p-2">
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
                          
                          {/* 上传状态覆盖层 */}
                          {version.isOriginal && isUploading && (
                            <div className="absolute inset-0 bg-purple-600 bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-200 mb-2"></div>
                              <div className="text-purple-100 text-sm font-medium">正在上传...</div>
                            </div>
                          )}
                          
                          {/* 上传成功覆盖层 */}
                          {version.isOriginal && uploadSuccess && (
                            <div className="absolute inset-0 bg-green-600 bg-opacity-80 flex flex-col items-center justify-center rounded-lg transition-all duration-300">
                              <div className="bg-white rounded-full p-2 mb-2">
                                <Check className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="text-white text-sm font-medium">上传成功！</div>
                            </div>
                          )}
                          
                          {/* 悬停效果 */}
                          {(!version.isOriginal || (!isUploading && !uploadSuccess)) && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8" />
                            </div>
                          )}
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

                        {/* Delete Button for Generated Images */}
                        {!version.isOriginal && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteConfirm(index)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Latest Image Indicator */}
                      {index === imageVersions.length - 1 && !version.isOriginal && (
                        <div className="absolute top-1 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                          最新
                        </div>
                      )}

                      {/* Style/Prompt Display for Generated Images */}
                      {!version.isOriginal && (version.style || version.prompt) && (
                        <div className="mt-2 px-2">
                          <div className="text-xs text-gray-600 truncate max-w-full" title={version.style || version.prompt}>
                            {version.style || version.prompt}
                          </div>
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
                      <div className="font-medium">AI处理中</div>
                      <div className="text-sm mt-1">请耐心等待...</div>
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
                      disabled={isProcessing || isUploading || imageVersions.length === 0}
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
                          disabled={isProcessing || isUploading || imageVersions.length === 0}
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
                      placeholder="例如：给她戴上眼镜，将背景改为夕阳西下的海滩，增加温暖的光线效果..."
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      className="min-h-24"
                      disabled={isProcessing || isUploading || imageVersions.length === 0}
                    />

                    <Button
                      onClick={handlePromptSubmit}
                      disabled={isProcessing || isUploading || imageVersions.length === 0 || !currentPrompt.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI处理中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          开始AI编辑
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
      </div>



             {/* Image Modal */}
       <ImageModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         imageUrl={selectedImage}
         imageInfo={(() => {
           const selectedVersion = imageVersions.find(v => v.url === selectedImage)
           if (selectedVersion && !selectedVersion.isOriginal) {
             return {
               style: selectedVersion.style,
               prompt: selectedVersion.prompt
             }
           }
           return null
         })()}
         onDownload={handleDownload}
         downloadFilename="图片"
         images={imageVersions.map(version => ({
           url: version.url,
           info: version.isOriginal ? undefined : {
             style: version.style,
             prompt: version.prompt
           }
         }))}
         currentIndex={currentImageIndex}
         onNavigate={handleNavigate}
       />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">确认删除</h2>
      </div>
            <p className="text-sm text-gray-600">
              确定要删除这张图片吗？此操作无法撤销。
            </p>
            <div className="flex space-x-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmOpen(false)}
              >
                取消
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteFromIndex}
              >
                删除
              </Button>
      </div>
    </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
