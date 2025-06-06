"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Download, Maximize2, Clock, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface HistoryProject {
  id: string
  originalImage: {
    url: string
    createdAt: string
  }
  editedImages: {
    id: string
    url: string
    prompt?: string
    style?: string
    aspectRatio?: string
    createdAt: string
  }[]
}

interface HistoryRecord {
  id: string
  originalImageUrl: string
  generatedImageUrl: string
  prompt?: string
  style?: string
  aspectRatio?: string
  createdAt: string
}

export default function HistoryPage() {
  const [historyProjects, setHistoryProjects] = useState<HistoryProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageInfo, setSelectedImageInfo] = useState<{style?: string, prompt?: string, createdAt: string} | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      // 使用真实的Unsplash图片作为历史记录数据
      const mockProjects: HistoryProject[] = [
        {
          id: "project-1",
          originalImage: {
            url: "https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=400&h=400&fit=crop",
            createdAt: "2024-01-15T10:30:00Z"
          },
          editedImages: [
            {
              id: "edit-1",
              url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop",
              style: "吉卜力风格",
              aspectRatio: "1:1",
              createdAt: "2024-01-15T10:35:00Z"
            },
            {
              id: "edit-2", 
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
              prompt: "增加温暖的光线效果",
              aspectRatio: "1:1",
              createdAt: "2024-01-15T10:40:00Z"
            },
            {
              id: "edit-3",
              url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
              style: "水彩画风格",
              aspectRatio: "16:9",
              createdAt: "2024-01-15T10:45:00Z"
            }
          ]
        },
        {
          id: "project-2",
          originalImage: {
            url: "https://images.unsplash.com/photo-1494790108755-2616c27b7daa?w=400&h=400&fit=crop",
            createdAt: "2024-01-14T15:45:00Z"
          },
          editedImages: [
            {
              id: "edit-4",
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
              prompt: "给她戴上眼镜，将背景改为夕阳西下的海滩",
              aspectRatio: "16:9",
              createdAt: "2024-01-14T15:50:00Z"
            },
            {
              id: "edit-5",
              url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=225&h=400&fit=crop",
              style: "赛博朋克",
              aspectRatio: "9:16",
              createdAt: "2024-01-14T16:00:00Z"
            }
          ]
        },
        {
          id: "project-3",
          originalImage: {
            url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
            createdAt: "2024-01-13T14:20:00Z"
          },
          editedImages: [
            {
              id: "edit-6",
              url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop",
              style: "油画风格",
              aspectRatio: "4:3",
              createdAt: "2024-01-13T14:25:00Z"
            }
          ]
        },
        {
          id: "project-4",
          originalImage: {
            url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
            createdAt: "2024-01-12T09:15:00Z"
          },
          editedImages: [
            {
              id: "edit-7",
              url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
              style: "动漫风格",
              aspectRatio: "1:1",
              createdAt: "2024-01-12T09:20:00Z"
            },
            {
              id: "edit-8",
              url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=225&fit=crop",
              prompt: "添加樱花背景，柔和粉色调",
              aspectRatio: "16:9",
              createdAt: "2024-01-12T09:25:00Z"
            }
          ]
        },
        {
          id: "project-5",
          originalImage: {
            url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
            createdAt: "2024-01-11T16:30:00Z"
          },
          editedImages: [
            {
              id: "edit-9",
              url: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop",
              style: "素描风格",
              aspectRatio: "1:1",
              createdAt: "2024-01-11T16:35:00Z"
            }
          ]
        },
        {
          id: "project-6",
          originalImage: {
            url: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop",
            createdAt: "2024-01-10T14:45:00Z"
          },
          editedImages: [
            {
              id: "edit-10",
              url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
              style: "梵高风格",
              aspectRatio: "1:1",
              createdAt: "2024-01-10T14:50:00Z"
            },
            {
              id: "edit-11",
              url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
              prompt: "转换为黑白照片，增强对比度",
              aspectRatio: "4:3",
              createdAt: "2024-01-10T14:55:00Z"
            }
          ]
        },
        {
          id: "project-7",
          originalImage: {
            url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
            createdAt: "2024-01-09T11:20:00Z"
          },
          editedImages: [
            {
              id: "edit-12",
              url: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?w=400&h=400&fit=crop",
              style: "像素艺术",
              aspectRatio: "1:1",
              createdAt: "2024-01-09T11:25:00Z"
            }
          ]
        },
        {
          id: "project-8",
          originalImage: {
            url: "https://images.unsplash.com/photo-1522075469751-3847ae2c1b2e?w=400&h=400&fit=crop",
            createdAt: "2024-01-08T08:10:00Z"
          },
          editedImages: [
            {
              id: "edit-13",
              url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=225&fit=crop",
              prompt: "添加科技感元素，霓虹灯效果",
              aspectRatio: "16:9",
              createdAt: "2024-01-08T08:15:00Z"
            },
            {
              id: "edit-14",
              url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=225&h=400&fit=crop",
              style: "赛博朋克",
              aspectRatio: "9:16",
              createdAt: "2024-01-08T08:20:00Z"
            }
          ]
        },
        {
          id: "project-9",
          originalImage: {
            url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop",
            createdAt: "2024-01-07T13:30:00Z"
          },
          editedImages: [
            {
              id: "edit-15",
              url: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop",
              style: "水彩画风格",
              aspectRatio: "1:1",
              createdAt: "2024-01-07T13:35:00Z"
            }
          ]
        },
        {
          id: "project-10",
          originalImage: {
            url: "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=400&h=400&fit=crop",
            createdAt: "2024-01-06T10:00:00Z"
          },
          editedImages: [
            {
              id: "edit-16",
              url: "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=300&fit=crop",
              style: "油画风格",
              aspectRatio: "4:3",
              createdAt: "2024-01-06T10:05:00Z"
            },
            {
              id: "edit-17",
              url: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=225&fit=crop",
              prompt: "增加复古滤镜，暖色调处理",
              aspectRatio: "16:9",
              createdAt: "2024-01-06T10:10:00Z"
            }
          ]
        }
      ]
      
      setTimeout(() => {
        setHistoryProjects(mockProjects)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('加载历史记录失败:', error)
      setIsLoading(false)
    }
  }

  const handleImageClick = (imageUrl: string, imageInfo: {style?: string, prompt?: string, createdAt: string}) => {
    setSelectedImage(imageUrl)
    setSelectedImageInfo(imageInfo)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="text-gray-600">加载历史记录中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/protected">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回创作空间
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
              <p className="text-gray-600">查看您的图片编辑历史</p>
            </div>
          </div>
        </div>

        {/* History Projects */}
        {historyProjects.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无编辑历史</h3>
            <p className="text-gray-500 mb-6">开始创作您的第一张图片吧！</p>
            <Link href="/protected">
              <Button className="bg-purple-600 hover:bg-purple-700">
                开始创作
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Projects List with Pagination */}
            <div className="space-y-8">
              {historyProjects
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">项目 {project.id.split('-')[1]}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(project.originalImage.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.editedImages.length} 个编辑版本
                      </div>
                    </div>

                    {/* Horizontal Scrolling Images */}
                    <div className="relative">
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {/* Original Image */}
                        <div className="flex-shrink-0 relative group">
                          <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative bg-gray-50 flex items-center justify-center">
                            <div
                              className="relative w-full h-full flex items-center justify-center cursor-pointer"
                              onClick={() => handleImageClick(project.originalImage.url, {createdAt: project.originalImage.createdAt})}
                            >
                              <Image
                                src={project.originalImage.url}
                                alt="原始图片"
                                width={240}
                                height={240}
                                className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              原图
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(project.originalImage.url, `原图_${project.id}`)
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Edited Images */}
                        {project.editedImages.map((editedImage, index) => (
                          <div key={editedImage.id} className="flex-shrink-0 relative group">
                            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative bg-gray-50 flex items-center justify-center">
                              <div
                                className="relative w-full h-full flex items-center justify-center cursor-pointer"
                                onClick={() => handleImageClick(editedImage.url, editedImage)}
                              >
                                <Image
                                  src={editedImage.url}
                                  alt={`编辑图片 ${index + 1}`}
                                  width={240}
                                  height={240}
                                  className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                编辑 {index + 1}
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(editedImage.url, `编辑图片_${editedImage.id}`)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                            {/* Style/Prompt Display */}
                            {(editedImage.style || editedImage.prompt) && (
                              <div className="mt-2 px-2">
                                <div className="text-xs text-gray-600 truncate max-w-full" title={editedImage.style || editedImage.prompt}>
                                  {editedImage.style || editedImage.prompt}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {historyProjects.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({length: Math.ceil(historyProjects.length / itemsPerPage)}, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(historyProjects.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(historyProjects.length / itemsPerPage)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Screen Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-4xl w-[90vw] h-[80vh] p-0">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">历史记录详情</h2>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => selectedImage && handleDownload(selectedImage, `历史图片`)}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>下载</span>
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            {selectedImage && (
              <div className="flex flex-col items-center max-w-full max-h-full">
                <div className="relative">
                  <Image
                    src={selectedImage}
                    alt="历史图片"
                    width={800}
                    height={600}
                    className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
                
                {selectedImageInfo && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border max-w-2xl">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(selectedImageInfo.createdAt)}
                      </div>
                      {selectedImageInfo.style && (
                        <div>
                          <span className="font-medium text-gray-900">应用风格: </span>
                          <span className="text-purple-600">{selectedImageInfo.style}</span>
                        </div>
                      )}
                      {selectedImageInfo.prompt && (
                        <div>
                          <span className="font-medium text-gray-900">提示词: </span>
                          <span className="text-gray-700">{selectedImageInfo.prompt}</span>
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
    </>
  )
} 