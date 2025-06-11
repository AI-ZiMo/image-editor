import { supabase } from './supabase'

// AI Service Configuration
const AI_PROVIDER = process.env.EXPO_PUBLIC_AI_PROVIDER || 'tuzi'
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'flux-kontext-pro'
const TUZI_API_KEY = process.env.EXPO_PUBLIC_TUZI_API_KEY
const REPLICATE_API_TOKEN = process.env.EXPO_PUBLIC_REPLICATE_API_TOKEN

// Log initialization info
console.log('🚀 AI Service initialized with:', {
  provider: AI_PROVIDER,
  model: AI_MODEL,
  hasTuziKey: !!TUZI_API_KEY,
  hasReplicateToken: !!REPLICATE_API_TOKEN,
  envKeys: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_'))
})

// Direct Supabase operations - no more web API dependencies!

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
      console.log('📤 Starting direct Supabase image upload...')
      console.log('🖼️ Image URI:', imageUri)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        console.error('❌ No authenticated user for upload:', sessionError)
        return {
          success: false,
          error: 'Authentication required for upload',
        }
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileName = `${session.user.id}/${timestamp}_${randomId}.jpg`
      
      console.log('📁 Generated filename:', fileName)

      // Convert URI to blob for upload
      let imageBlob: Blob
      
      if (imageUri.startsWith('data:')) {
        // Handle base64 data URLs
        const response = await fetch(imageUri)
        imageBlob = await response.blob()
      } else {
        // Handle file URIs (React Native)
        const response = await fetch(imageUri)
        imageBlob = await response.blob()
      }

      console.log('📦 Image blob size:', imageBlob.size, 'bytes')

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('user_images')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (error) {
        console.error('❌ Supabase storage upload error:', error)
        return {
          success: false,
          error: `Storage upload failed: ${error.message}`,
        }
      }

      console.log('✅ Upload successful, path:', data.path)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_images')
        .getPublicUrl(fileName)

      console.log('🌐 Public URL:', publicUrl)
      
      return {
        success: true,
        fileUrl: publicUrl,
        filePath: data.path,
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
      console.log('🎨 Starting direct AI image edit...')
      console.log('📝 Edit request:', request)
      console.log('🔧 Using provider:', AI_PROVIDER, 'model:', AI_MODEL)

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        console.error('❌ No authenticated user for edit:', sessionError)
        return {
          success: false,
          error: 'Authentication required for editing',
        }
      }

      // Check and deduct credits first
      const creditsResult = await this.checkAndDeductCredits(session.user.id)
      if (!creditsResult.success) {
        return {
          success: false,
          error: creditsResult.error || 'Insufficient credits',
        }
      }

      // Make AI API call based on provider
      let aiResult: EditImageResponse
      if (AI_PROVIDER === 'tuzi') {
        aiResult = await this.editImageWithTuzi(request)
      } else {
        aiResult = await this.editImageWithReplicate(request)
      }

      if (!aiResult.success) {
        // Refund credits if AI call failed
        await this.refundCredits(session.user.id)
        return aiResult
      }

      // Save result to history
      await this.saveImageToHistory({
        userId: session.user.id,
        imageUrl: aiResult.predictionId!, // For Tuzi, this is the actual image URL
        prompt: request.prompt,
        aspectRatio: request.aspectRatio,
        parentImageId: request.parentImageId,
      })

      console.log('✅ Direct AI edit completed successfully')
      return aiResult
    } catch (error) {
      console.error('❌ Direct AI edit error:', error)
      return {
        success: false,
        error: `Failed to edit image: ${error}`,
      }
    }
  },

  // Tuzi AI implementation
  async editImageWithTuzi(request: EditImageRequest): Promise<EditImageResponse> {
    try {
      console.log('🐰 Making Tuzi AI request...')
      
      if (!TUZI_API_KEY) {
        return {
          success: false,
          error: 'Tuzi API key not configured'
        }
      }

      const payload = {
        model: AI_MODEL,
        prompt: `${request.inputImage} ${request.prompt}`,
        aspect_ratio: request.aspectRatio || "1:1",
        output_format: "png",
        safety_tolerance: 2,
        prompt_upsampling: false
      }

      console.log('📤 Tuzi request payload:', payload)

      const response = await fetch('https://api.tu-zi.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TUZI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('📊 Tuzi response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Tuzi API error:', errorText)
        return {
          success: false,
          error: `Tuzi API error: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('✅ Tuzi response data:', data)

      if (data.data && data.data.length > 0) {
        return {
          success: true,
          predictionId: data.data[0].url, // Tuzi returns image URL directly
          status: 'succeeded',
        }
      } else {
        return {
          success: false,
          error: data.error || 'No image generated by Tuzi AI',
        }
      }
    } catch (error) {
      console.error('❌ Tuzi AI error:', error)
      return {
        success: false,
        error: `Tuzi AI request failed: ${error}`,
      }
    }
  },

  // Replicate AI implementation
  async editImageWithReplicate(request: EditImageRequest): Promise<EditImageResponse> {
    try {
      console.log('🔄 Making Replicate AI request...')
      
      if (!REPLICATE_API_TOKEN) {
        return {
          success: false,
          error: 'Replicate API token not configured'
        }
      }

      const modelPath = AI_MODEL === 'flux-kontext-pro' 
        ? 'black-forest-labs/flux-kontext-pro/predictions'
        : 'black-forest-labs/flux-kontext-max/predictions'

      const payload = {
        input: {
          aspect_ratio: request.aspectRatio || "match_input_image",
          input_image: request.inputImage,
          output_format: "png",
          prompt: request.prompt,
          safety_tolerance: 2
        }
      }

      console.log('📤 Replicate request payload:', payload)

      const response = await fetch(`https://api.replicate.com/v1/models/${modelPath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('📊 Replicate response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Replicate API error:', errorText)
        return {
          success: false,
          error: `Replicate API error: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('✅ Replicate response data:', data)

      return {
        success: true,
        predictionId: data.id,
        status: data.status,
      }
    } catch (error) {
      console.error('❌ Replicate AI error:', error)
      return {
        success: false,
        error: `Replicate AI request failed: ${error}`,
      }
    }
  },

  async getUserCredits(): Promise<{ credits: number } | null> {
    try {
      console.log('💰 Getting user credits directly from Supabase...')
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        console.error('❌ No authenticated user:', sessionError)
        return null
      }

      console.log('🔍 Fetching credits for user:', session.user.id)

      // Query credits directly from Supabase
      const { data: credits, error: creditsError } = await supabase
        .from('ai_images_creator_credits')
        .select('credits')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (creditsError) {
        console.error('❌ Error fetching credits:', creditsError)
        return null
      }

      const userCredits = credits?.credits || 0
      console.log('✅ User credits fetched:', userCredits)
      
      return { credits: userCredits }
    } catch (error) {
      console.error('❌ Get credits error:', error)
      return null
    }
  },

  async getUserHistory(): Promise<any[]> {
    try {
      console.log('📚 Getting user history directly from Supabase...')
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        console.error('❌ No authenticated user:', sessionError)
        return []
      }

      console.log('🔍 Fetching history for user:', session.user.id)

      // Query history directly from Supabase
      const { data: history, error: historyError } = await supabase
        .from('ai_images_creator_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (historyError) {
        console.error('❌ Error fetching history:', historyError)
        return []
      }

      const historyCount = Array.isArray(history) ? history.length : 0
      console.log('✅ User history fetched:', historyCount, 'items')
      
      // Group by project_id to match web API structure
      const projectsMap = new Map()
      
      if (Array.isArray(history)) {
        history.forEach(item => {
        const projectId = item.project_id || 'default'
        
        if (!projectsMap.has(projectId)) {
          projectsMap.set(projectId, {
            project_id: projectId,
            original_image: item.parent_image_id ? null : item,
            edits: []
          })
        }
        
          if (item.parent_image_id) {
            projectsMap.get(projectId).edits.push(item)
          }
        })
      }
      
      const projects = Array.from(projectsMap.values())
      console.log('✅ Organized into', projects.length, 'projects')
      
      return projects
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

      if (AI_PROVIDER === 'tuzi') {
        // Tuzi AI returns results synchronously, so predictionId is the actual image URL
        console.log('✅ Tuzi AI result (synchronous):', predictionId)
        return {
          success: true,
          status: 'succeeded',
          output: predictionId // The image URL
        }
      } else {
        // Replicate AI requires status polling
        return this.checkReplicateStatus(predictionId)
      }
    } catch (error) {
      console.error('❌ Check prediction error:', error)
      return {
        success: false,
        error: `Failed to check prediction status: ${error}`,
      }
    }
  },

  // Replicate status checking
  async checkReplicateStatus(predictionId: string): Promise<{
    success: boolean
    status?: string
    output?: string
    error?: string
  }> {
    try {
      console.log('🔄 Checking Replicate status for:', predictionId)
      
      if (!REPLICATE_API_TOKEN) {
        return {
          success: false,
          error: 'Replicate API token not configured'
        }
      }

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Replicate status check error:', errorText)
        return {
          success: false,
          error: `Replicate status check failed: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('✅ Replicate status data:', data)

      return {
        success: true,
        status: data.status,
        output: data.output?.[0], // Get first output URL
        error: data.error
      }
    } catch (error) {
      console.error('❌ Replicate status check error:', error)
      return {
        success: false,
        error: `Replicate status check failed: ${error}`,
      }
    }
  },

  // Credit management functions
  async checkAndDeductCredits(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💳 Checking and deducting credits for user:', userId)

      // Use RPC function to atomically check and deduct credits
      const { data, error } = await supabase.rpc('deduct_user_credits', { 
        p_user_id: userId, 
        p_amount: 1 
      })

      if (error) {
        console.error('❌ Credit deduction error:', error)
        return {
          success: false,
          error: error.message.includes('insufficient') ? 'Insufficient credits' : 'Credit check failed'
        }
      }

      console.log('✅ Credits deducted successfully, remaining:', data)
      return { success: true }
    } catch (error) {
      console.error('❌ Credit check error:', error)
      return {
        success: false,
        error: 'Failed to check credits'
      }
    }
  },

  async refundCredits(userId: string): Promise<void> {
    try {
      console.log('💰 Refunding credits for user:', userId)

      const { error } = await supabase.rpc('add_user_credits', { 
        p_user_id: userId, 
        p_amount: 1 
      })

      if (error) {
        console.error('❌ Credit refund error:', error)
      } else {
        console.log('✅ Credits refunded successfully')
      }
    } catch (error) {
      console.error('❌ Credit refund error:', error)
    }
  },

  // Save image to history
  async saveImageToHistory(params: {
    userId: string
    imageUrl: string
    prompt: string
    aspectRatio?: string
    parentImageId?: string
  }): Promise<void> {
    try {
      console.log('💾 Saving image to history:', params)

      // Generate project ID (use parent's project ID or create new one)
      let projectId = params.parentImageId || `project_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      // If this is an edit (has parentImageId), get the project ID from the parent
      if (params.parentImageId) {
        const { data: parentImage } = await supabase
          .from('ai_images_creator_history')
          .select('project_id')
          .eq('id', params.parentImageId)
          .single()

        if (parentImage) {
          projectId = parentImage.project_id
        }
      }

      const { error } = await supabase
        .from('ai_images_creator_history')
        .insert({
          user_id: params.userId,
          image_url: params.imageUrl,
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio,
          parent_image_id: params.parentImageId,
          project_id: projectId,
        })

      if (error) {
        console.error('❌ Failed to save image to history:', error)
      } else {
        console.log('✅ Image saved to history successfully')
      }
    } catch (error) {
      console.error('❌ Save to history error:', error)
    }
  },
}