"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Download, X, Clock, ChevronLeft, ChevronRight, Check, RotateCw, RotateCcw } from "lucide-react"
import { useEffect, useState, useRef } from "react"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  imageInfo?: {
    style?: string
    prompt?: string
    createdAt?: string
  } | null
  onDownload?: (imageUrl: string, filename: string) => void
  downloadFilename?: string
  // 新增切换功能相关的props
  images?: Array<{
    url: string
    info?: {
      style?: string
      prompt?: string
      createdAt?: string
    }
  }>
  currentIndex?: number
  onNavigate?: (index: number) => void
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageInfo,
  onDownload,
  downloadFilename = "图片",
  images,
  currentIndex,
  onNavigate
}: ImageModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [rotation, setRotation] = useState(0) // 旋转角度状态
  const [imageLoaded, setImageLoaded] = useState(false) // 图片加载状态
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }) // 图片原始尺寸
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 键盘导航支持
  useEffect(() => {
    if (!isOpen || !images || !onNavigate || typeof currentIndex !== 'number') return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1)
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, images, currentIndex, onNavigate])

  // 重置下载状态和旋转状态当图片改变时
  useEffect(() => {
    setDownloadSuccess(false)
    setIsDownloading(false)
    setRotation(0) // 重置旋转角度
    setImageLoaded(false) // 重置图片加载状态
    setImageDimensions({ width: 0, height: 0 }) // 重置图片尺寸
  }, [imageUrl])

  // 监听窗口大小改变，强制重新渲染以重新计算容器尺寸
  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => {
      // 强制重新渲染
      setImageLoaded(prev => prev)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  const canGoLeft = images && onNavigate && typeof currentIndex === 'number' && currentIndex > 0
  const canGoRight = images && onNavigate && typeof currentIndex === 'number' && currentIndex < images.length - 1

  // 顺时针旋转图片
  const handleRotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // 逆时针旋转图片
  const handleRotateCounterClockwise = () => {
    setRotation(prev => (prev - 90 + 360) % 360)
  }

  // 处理图片加载完成
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current
      setImageDimensions({ width: naturalWidth, height: naturalHeight })
      setImageLoaded(true)
    }
  }

  // 计算旋转后的容器尺寸
  const getContainerStyle = () => {
    if (!imageLoaded || !imageDimensions.width || !imageDimensions.height) {
      return {
        maxHeight: 'calc(100% - 100px)',
        width: 'fit-content',
        maxWidth: '90vw'
      }
    }

    const isRotated = rotation === 90 || rotation === 270
    const { width: originalWidth, height: originalHeight } = imageDimensions
    
    // 旋转后的实际显示宽高
    const displayWidth = isRotated ? originalHeight : originalWidth
    const displayHeight = isRotated ? originalWidth : originalHeight
    
    // 计算旋转后的宽高比
    const displayAspectRatio = displayWidth / displayHeight
    
    // 视口尺寸（预留空间给UI元素）
    const maxViewportWidth = window.innerWidth * 0.85
    const maxViewportHeight = window.innerHeight * 0.7
    
    let containerWidth, containerHeight
    
    // 计算合适的显示尺寸
    let scale = 1
    
    // 如果图片太大，需要缩放
    if (displayWidth > maxViewportWidth || displayHeight > maxViewportHeight) {
      const widthScale = maxViewportWidth / displayWidth
      const heightScale = maxViewportHeight / displayHeight
      scale = Math.min(widthScale, heightScale)
    }
    
    // 如果图片太小，适度放大（但不超过原始尺寸的2倍）
    if (displayWidth < 300 && displayHeight < 300) {
      const minScale = Math.min(300 / displayWidth, 300 / displayHeight, 2)
      scale = Math.max(scale, minScale)
    }
    
    containerWidth = displayWidth * scale
    containerHeight = displayHeight * scale
    
    return {
      width: `${Math.round(containerWidth)}px`,
      height: `${Math.round(containerHeight)}px`,
      minWidth: '200px',
      minHeight: '150px',
      flexShrink: 0
    }
  }

  // 将旋转后的图片渲染到canvas并返回blob
  const getRotatedImageBlob = async (): Promise<Blob | null> => {
    if (!imageRef.current || !canvasRef.current || !imageUrl) return null

    const img = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    // 等待图片加载完成
    if (!img.complete) {
      await new Promise((resolve) => {
        img.onload = resolve
      })
    }

    const { naturalWidth, naturalHeight } = img
    
    // 根据旋转角度设置canvas尺寸
    if (rotation === 90 || rotation === 270) {
      canvas.width = naturalHeight
      canvas.height = naturalWidth
    } else {
      canvas.width = naturalWidth
      canvas.height = naturalHeight
    }

    // 清除canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 移动到中心点
    ctx.translate(canvas.width / 2, canvas.height / 2)
    
    // 旋转
    ctx.rotate((rotation * Math.PI) / 180)
    
    // 绘制图片（从中心点开始）
    ctx.drawImage(img, -naturalWidth / 2, -naturalHeight / 2, naturalWidth, naturalHeight)
    
    // 重置变换
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })
  }

  const handleDownload = async () => {
    if (!onDownload || !imageUrl) return
    
    setIsDownloading(true)
    setDownloadSuccess(false)
    
    try {
      if (rotation === 0) {
        // 没有旋转，使用原有的下载方法
        await onDownload(imageUrl, downloadFilename)
      } else {
        // 有旋转，下载旋转后的图片
        const rotatedBlob = await getRotatedImageBlob()
        if (rotatedBlob) {
          const url = window.URL.createObjectURL(rotatedBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${downloadFilename}_旋转${rotation}度.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
      }
      
      setDownloadSuccess(true)
      
      // 2秒后重置状态
      setTimeout(() => {
        setDownloadSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('下载失败:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl w-[95vw] h-[95vh] p-0 bg-white [&>button]:hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <h2 className="text-lg font-semibold">图片预览</h2>
          <div className="flex items-center space-x-3">
            {/* 旋转按钮 */}
            <Button
              onClick={handleRotateCounterClockwise}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>逆时针</span>
            </Button>
            
            <Button
              onClick={handleRotateClockwise}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCw className="h-4 w-4" />
              <span>顺时针</span>
            </Button>
            
            {onDownload && imageUrl && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center space-x-2 transition-all duration-300 ${
                  downloadSuccess 
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>下载中...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>已完成</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>下载</span>
                  </>
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-white relative overflow-hidden">
          {/* 左右导航按钮 */}
          {canGoLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white md:bg-white/90 hover:bg-white shadow-lg z-10"
              onClick={() => onNavigate!(currentIndex! - 1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {canGoRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white md:bg-white/90 hover:bg-white shadow-lg z-10"
              onClick={() => onNavigate!(currentIndex! + 1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

                      {imageUrl && (
            <div className="flex flex-col items-center max-w-full h-full justify-center">
              <div 
                className="relative bg-gray-200 p-3 rounded-lg shadow-2xl flex items-center justify-center transition-all duration-300"
                style={getContainerStyle()}
              >
                                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="预览图片"
                    className="rounded-md transition-transform duration-300"
                    style={{ 
                      imageOrientation: 'from-image',
                      transform: `rotate(${rotation}deg)`,
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                    }}
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    console.error('Image load error in modal:', e)
                  }}
                />
              </div>
              
              {/* 隐藏的canvas用于生成旋转后的图片 */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* 图片计数器 */}
              {images && typeof currentIndex === 'number' && (
                <div className="mt-3 px-3 py-1 bg-black md:bg-black/60 text-white text-sm rounded-full">
                  {currentIndex + 1} / {images.length}
                  {rotation > 0 && <span className="ml-2 text-yellow-300">旋转{rotation}°</span>}
                </div>
              )}

              {imageInfo && (imageInfo.style || imageInfo.prompt || imageInfo.createdAt) && (
                <div className="mt-3 p-3 bg-white rounded-lg shadow-sm border max-w-2xl">
                  <div className="space-y-1 text-sm">
                    {imageInfo.createdAt && (
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(imageInfo.createdAt)}
                      </div>
                    )}
                    {imageInfo.style && (
                      <div>
                        <span className="font-medium text-gray-900">应用风格: </span>
                        <span className="text-purple-600">{imageInfo.style}</span>
                      </div>
                    )}
                    {imageInfo.prompt && (
                      <div>
                        <span className="font-medium text-gray-900">提示词: </span>
                        <span className="text-gray-700">{imageInfo.prompt}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 