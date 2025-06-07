"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Download, X, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useEffect, useState } from "react"

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

  // 重置下载状态当图片改变时
  useEffect(() => {
    setDownloadSuccess(false)
    setIsDownloading(false)
  }, [imageUrl])

  const canGoLeft = images && onNavigate && typeof currentIndex === 'number' && currentIndex > 0
  const canGoRight = images && onNavigate && typeof currentIndex === 'number' && currentIndex < images.length - 1

  const handleDownload = async () => {
    if (!onDownload || !imageUrl) return
    
    setIsDownloading(true)
    setDownloadSuccess(false)
    
    try {
      await onDownload(imageUrl, downloadFilename)
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

        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-white relative">
          {/* 左右导航按钮 */}
          {canGoLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
              onClick={() => onNavigate!(currentIndex! - 1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {canGoRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
              onClick={() => onNavigate!(currentIndex! + 1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {imageUrl && (
            <div className="flex flex-col items-center max-w-full h-full justify-center">
              <div className="relative bg-gray-200 p-3 rounded-lg shadow-2xl max-h-[calc(100%-100px)]">
                {imageUrl.includes('supabase.co') ? (
                  // 对于 Supabase 图片使用原生 img 标签避免 Next.js 优化超时
                  <img
                    src={imageUrl}
                    alt="预览图片"
                    className="max-w-full max-h-[75vh] object-contain rounded-md"
                    onError={(e) => {
                      console.error('Supabase image load error in modal:', e)
                    }}
                  />
                ) : (
                  // 对于其他图片继续使用 Next.js Image 组件
                  <Image
                    src={imageUrl}
                    alt="预览图片"
                    width={1200}
                    height={900}
                    className="max-w-full max-h-[75vh] object-contain rounded-md"
                  />
                )}
              </div>
              
              {/* 图片计数器 */}
              {images && typeof currentIndex === 'number' && (
                <div className="mt-3 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                  {currentIndex + 1} / {images.length}
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