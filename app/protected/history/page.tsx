"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Download, Maximize2, Clock, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ImageModal } from "@/components/image-modal"
import Link from "next/link"

interface DatabaseProject {
  project_id: string
  project_name: string | null
  original_image_url: string
  latest_image_url: string
  total_images: number
  created_at: string
  updated_at: string
}

interface ProjectImage {
  id: string
  parent_id: string | null
  image_url: string
  storage_path: string | null
  prompt: string | null
  style: string | null
  is_original: boolean
  created_at: string
  chain_order: number
}

interface HistoryProject {
  id: string
  name: string | null
  originalImage: {
    url: string
    createdAt: string
  }
  editedImages: {
    id: string
    url: string
    prompt?: string
    style?: string
    createdAt: string
  }[]
  totalImages: number
  updatedAt: string
}

export default function HistoryPage() {
  const [historyProjects, setHistoryProjects] = useState<HistoryProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageInfo, setSelectedImageInfo] = useState<{style?: string, prompt?: string, createdAt: string} | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [currentProjectImages, setCurrentProjectImages] = useState<Array<{url: string, info?: any}>>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      console.log('=== 加载用户历史记录 ===')
      
      // 获取用户项目列表
      const response = await fetch('/api/user-history')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('项目列表数据:', data)
      
      if (!data.projects || data.projects.length === 0) {
        console.log('用户暂无历史记录')
        setHistoryProjects([])
        return
      }
      
      // 为每个项目获取详细的图片链
      const projectsWithImages = await Promise.all(
        data.projects.map(async (project: DatabaseProject) => {
          try {
            console.log(`获取项目 ${project.project_id} 的图片链`)
            
            const imagesResponse = await fetch(`/api/project-images?projectId=${project.project_id}`)
            if (!imagesResponse.ok) {
              console.error(`获取项目图片失败: ${imagesResponse.status}`)
              throw new Error(`Failed to fetch images for project ${project.project_id}`)
            }
            
            const imagesData = await imagesResponse.json()
            console.log(`项目 ${project.project_id} 图片数据:`, imagesData)
            
            const images: ProjectImage[] = imagesData.images || []
            
            // 分离原图和编辑图片
            const originalImage = images.find(img => img.is_original)
            const editedImages = images.filter(img => !img.is_original)
            
            const historyProject: HistoryProject = {
              id: project.project_id,
              name: project.project_name,
              originalImage: {
                url: originalImage?.image_url || project.original_image_url,
                createdAt: originalImage?.created_at || project.created_at
              },
              editedImages: editedImages.map(img => ({
                id: img.id,
                url: img.image_url,
                prompt: img.prompt || undefined,
                style: img.style || undefined,
                createdAt: img.created_at
              })),
              totalImages: project.total_images,
              updatedAt: project.updated_at
            }
            
            return historyProject
          } catch (error) {
            console.error(`处理项目 ${project.project_id} 时出错:`, error)
            // 如果获取图片失败，至少返回基本项目信息
            return {
              id: project.project_id,
              name: project.project_name,
              originalImage: {
                url: project.original_image_url,
                createdAt: project.created_at
              },
              editedImages: [],
              totalImages: project.total_images,
              updatedAt: project.updated_at
            }
          }
        })
      )
      
      console.log('完整的历史项目数据:', projectsWithImages)
      setHistoryProjects(projectsWithImages)
      
    } catch (error) {
      console.error('加载历史记录失败:', error)
      setHistoryProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageClick = (imageUrl: string, imageInfo: {style?: string, prompt?: string, createdAt: string}, projectId?: string) => {
    if (projectId) {
      // 找到对应的项目
      const project = historyProjects.find(p => p.id === projectId)
      if (project) {
        // 构建图片数组（原图 + 编辑图）
        const allImages = [
          {
            url: project.originalImage.url,
            info: {
              createdAt: project.originalImage.createdAt
            }
          },
          ...project.editedImages.map(img => ({
            url: img.url,
            info: {
              style: img.style,
              prompt: img.prompt,
              createdAt: img.createdAt
            }
          }))
        ]
        
        // 找到当前图片的索引
        const index = allImages.findIndex(img => img.url === imageUrl)
        
        setCurrentProjectImages(allImages)
        setCurrentImageIndex(index >= 0 ? index : 0)
        setCurrentProjectId(projectId)
      }
    }
    
    setSelectedImage(imageUrl)
    setSelectedImageInfo(imageInfo)
    setIsModalOpen(true)
  }

  const handleNavigate = (index: number) => {
    if (currentProjectImages[index]) {
      setCurrentImageIndex(index)
      setSelectedImage(currentProjectImages[index].url)
      setSelectedImageInfo(currentProjectImages[index].info)
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
                        <h3 className="text-lg font-semibold">
                          {project.name || `项目 ${project.id.substring(0, 8)}`}
                        </h3>
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
                              onClick={() => handleImageClick(project.originalImage.url, {createdAt: project.originalImage.createdAt}, project.id)}
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
                                onClick={() => handleImageClick(editedImage.url, editedImage, project.id)}
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

             {/* Image Modal */}
       <ImageModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         imageUrl={selectedImage}
         imageInfo={selectedImageInfo}
         onDownload={handleDownload}
         downloadFilename="历史图片"
         images={currentProjectImages}
         currentIndex={currentImageIndex}
         onNavigate={handleNavigate}
       />
    </>
  )
} 