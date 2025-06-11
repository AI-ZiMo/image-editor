import { supabase } from './supabase'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://localhost:3000'

// 获取认证头的辅助函数
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return headers
}

export interface EditImageRequest {
  inputImage: string
  prompt: string
  aspectRatio?: string
  parentImageId?: string
}

export interface EditImageResponse {
  success: boolean
  predictionId?: string
  status?: string
  userId?: string
  error?: string
}

export interface UploadImageResponse {
  success: boolean
  fileUrl?: string
  filePath?: string
  error?: string
}

export const aiService = {
  async uploadImage(imageUri: string): Promise<UploadImageResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const formData = new FormData()
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any)

      const headers: any = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
        headers,
      })

      const data = await response.json()
      
      // Transform API response to match interface
      return {
        success: data.success,
        fileUrl: data.fileUrl,
        filePath: data.filePath,
        error: data.error
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image',
      }
    }
  },

  async editImage(request: EditImageRequest): Promise<EditImageResponse> {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/api/edit-image`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Edit image error:', error)
      return {
        success: false,
        error: 'Failed to edit image',
      }
    }
  },

  async getUserCredits(): Promise<{ credits: number } | null> {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/api/user-credits`, {
        method: 'GET',
        headers,
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get credits error:', error)
      return null
    }
  },

  async getUserHistory(): Promise<any[]> {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/api/user-history`, {
        method: 'GET',
        headers,
      })
      const data = await response.json()
      return data.projects || []
    } catch (error) {
      console.error('Get history error:', error)
      return []
    }
  },

  async checkPredictionStatus(predictionId: string): Promise<{
    success: boolean
    status?: string
    output?: string
    error?: string
  }> {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/api/check-prediction?id=${predictionId}`, {
        method: 'GET',
        headers,
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Check prediction error:', error)
      return {
        success: false,
        error: 'Failed to check prediction status',
      }
    }
  },
}