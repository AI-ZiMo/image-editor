import { supabase } from './supabase'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://localhost:3000'

// Log initialization info
console.log('🚀 AI Service initialized with:', {
  apiBaseUrl: API_BASE_URL,
  hasEnvVar: !!process.env.EXPO_PUBLIC_API_BASE_URL,
  envKeys: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_'))
})

// 获取认证头的辅助函数
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  console.log('🔑 Getting auth headers...')
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('❌ Auth session error:', error)
  }
  
  console.log('👤 Session info:', {
    hasSession: !!session,
    hasAccessToken: !!session?.access_token,
    userId: session?.user?.id,
    tokenLength: session?.access_token?.length
  })
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
    console.log('✅ Added authorization header')
  } else {
    console.warn('⚠️ No access token available')
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
      console.log('📤 Starting image upload...')
      console.log('🖼️ Image URI:', imageUri)
      console.log('🌐 API Base URL:', API_BASE_URL)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error during upload:', sessionError)
      }
      
      const formData = new FormData()
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any)

      const headers: any = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
        console.log('✅ Added auth header to upload request')
      } else {
        console.warn('⚠️ No session/token for upload request')
      }

      const uploadUrl = `${API_BASE_URL}/api/upload-image`
      console.log('🚀 Making upload request to:', uploadUrl)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers,
      })

      console.log('📊 Upload response status:', response.status)
      console.log('📊 Upload response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Upload failed with status:', response.status, 'Body:', errorText)
        return {
          success: false,
          error: `Upload failed: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('✅ Upload response data:', data)
      
      // Transform API response to match interface
      return {
        success: data.success,
        fileUrl: data.fileUrl,
        filePath: data.filePath,
        error: data.error
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      return {
        success: false,
        error: `Failed to upload image: ${error}`,
      }
    }
  },

  async editImage(request: EditImageRequest): Promise<EditImageResponse> {
    try {
      console.log('🎨 Starting image edit...')
      console.log('📝 Edit request:', request)
      
      const headers = await getAuthHeaders()
      const editUrl = `${API_BASE_URL}/api/edit-image`
      
      console.log('🚀 Making edit request to:', editUrl)
      console.log('📋 Request headers:', headers)
      
      const response = await fetch(editUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      })

      console.log('📊 Edit response status:', response.status)
      console.log('📊 Edit response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Edit failed with status:', response.status, 'Body:', errorText)
        return {
          success: false,
          error: `Edit failed: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('✅ Edit response data:', data)
      return data
    } catch (error) {
      console.error('❌ Edit image error:', error)
      return {
        success: false,
        error: `Failed to edit image: ${error}`,
      }
    }
  },

  async getUserCredits(): Promise<{ credits: number } | null> {
    try {
      console.log('💰 Getting user credits...')
      const headers = await getAuthHeaders()
      const creditsUrl = `${API_BASE_URL}/api/user-credits`
      
      console.log('🚀 Making credits request to:', creditsUrl)
      
      const response = await fetch(creditsUrl, {
        method: 'GET',
        headers,
      })

      console.log('📊 Credits response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Credits failed with status:', response.status, 'Body:', errorText)
        return null
      }

      const data = await response.json()
      console.log('✅ Credits response data:', data)
      return data
    } catch (error) {
      console.error('❌ Get credits error:', error)
      return null
    }
  },

  async getUserHistory(): Promise<any[]> {
    try {
      console.log('📚 Getting user history...')
      const headers = await getAuthHeaders()
      const historyUrl = `${API_BASE_URL}/api/user-history`
      
      console.log('🚀 Making history request to:', historyUrl)
      
      const response = await fetch(historyUrl, {
        method: 'GET',
        headers,
      })

      console.log('📊 History response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ History failed with status:', response.status, 'Body:', errorText)
        return []
      }

      const data = await response.json()
      console.log('✅ History response data:', data)
      return data.projects || []
    } catch (error) {
      console.error('❌ Get history error:', error)
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
      console.log('🔍 Checking prediction status for ID:', predictionId)
      const headers = await getAuthHeaders()
      const statusUrl = `${API_BASE_URL}/api/check-prediction?id=${predictionId}`
      
      console.log('🚀 Making status check request to:', statusUrl)
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers,
      })

      console.log('📊 Status check response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Status check failed with status:', response.status, 'Body:', errorText)
        return {
          success: false,
          error: `Status check failed: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('✅ Status check response data:', data)
      return data
    } catch (error) {
      console.error('❌ Check prediction error:', error)
      return {
        success: false,
        error: `Failed to check prediction status: ${error}`,
      }
    }
  },
}