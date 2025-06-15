import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { aiService } from '@/lib/ai-service'

// 后台异步存储图片和历史记录（直接调用，避免HTTP复杂性）
async function storeImageInBackground(userId: string, imageUrl: string, prompt: string, aspectRatio: string, projectId?: string, parentId?: string) {
  try {
    console.log('=== 开始后台存储 ===')
    console.log('用户ID:', userId, '图片URL:', imageUrl?.substring(0, 50) + '...')
    
    // 使用service role client进行后台存储（避免身份验证问题）
    const serviceSupabase = await createServiceRoleClient()
    
    // 1. 下载并存储图片
    console.log('下载图片中...')
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`图片下载失败: ${imageResponse.status} ${imageResponse.statusText}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const uint8Array = new Uint8Array(imageBuffer)
    
    // 生成唯一文件名
    const fileName = `generated-${Date.now()}-${Math.random().toString(36).substring(2)}.png`
    const filePath = `${userId}/${fileName}`
    
    console.log('上传到Supabase Storage:', filePath)
    
    // 上传到Supabase Storage
    const { error: uploadError } = await serviceSupabase.storage
      .from('images')
      .upload(filePath, uint8Array, {
        contentType: 'image/png',
        upsert: false
      })
    
    if (uploadError) {
      throw new Error(`图片存储失败: ${uploadError.message}`)
    }
    
    // 获取公共URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    console.log('图片存储成功:', publicUrl.substring(0, 50) + '...')
    
    // 2. 保存到历史记录
    console.log('保存历史记录中...')
    
    if (projectId && parentId) {
      // 有项目上下文，添加到现有项目
      console.log('添加到现有项目:', projectId, '父图片:', parentId)
      const { data: newImageId, error: addError } = await serviceSupabase
        .rpc('add_generated_image', {
          p_user_id: userId,
          p_project_id: projectId,
          p_parent_id: parentId,
          p_image_url: publicUrl,
          p_storage_path: filePath,
          p_prompt: prompt || null,
          p_style: null,
          p_aspect_ratio: aspectRatio
        })
      
      if (addError) {
        console.error('添加到项目失败:', addError)
      } else {
        console.log('成功添加到项目，图片ID:', newImageId)
      }
    } else {
      // 没有项目上下文，创建新项目（兜底方案）
      console.log('没有项目上下文，创建新项目')
      const { data: newProjectId, error: projectError } = await serviceSupabase
        .rpc('create_new_project', {
          p_user_id: userId,
          p_image_url: publicUrl,
          p_storage_path: filePath,
          p_project_name: `AI生成 - ${new Date().toLocaleString()}`
        })
      
      if (projectError) {
        console.error('项目创建失败:', projectError)
      } else {
        console.log('项目创建成功:', newProjectId)
      }
    }
    
    
    console.log('=== 后台存储完成 ===')
    
  } catch (error) {
    console.error('=== 后台存储失败 ===')
    console.error('存储错误详情:', error)
    console.error('错误堆栈:', error instanceof Error ? error.stack : error)
    // 不抛出错误，避免影响主流程
  }
}

export async function POST(request: NextRequest) {
  let user: { id: string; email?: string } | null = null
  
  try {
    const { inputImage, prompt, aspectRatio = "match_input_image", projectId, parentId } = await request.json()
    
    console.log('=== AI图像编辑开始 ===')
    console.log('请求参数:', { 
      hasInputImage: !!inputImage, 
      prompt: prompt?.substring(0, 50) + '...', 
      aspectRatio 
    })
    
    if (!inputImage || !prompt) {
      console.error('缺少必需参数:', { inputImage: !!inputImage, prompt: !!prompt })
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get the current user
    const supabase = await createServerClient()
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
    user = authUser
    
    console.log('用户认证状态:', { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      userError: userError?.message 
    })
    
    if (userError || !user) {
      console.error('用户认证失败:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查用户当前积分是否充足（但不立即扣除）
    console.log('=== 检查用户积分是否充足 ===')
    const serviceSupabase = await createServiceRoleClient()
    const { data: currentCredits, error: creditsCheckError } = await serviceSupabase
      .from('ai_images_creator_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()
    
    console.log('当前积分查询结果:', { 
      currentCredits: currentCredits?.credits, 
      creditsCheckError: creditsCheckError?.message 
    })

    if (creditsCheckError || !currentCredits || currentCredits.credits < 1) {
      console.error('积分不足或查询失败:', { creditsCheckError, credits: currentCredits?.credits })
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    console.log('积分充足，开始处理图像...')

    // Create prediction using AI service (Replicate or Tuzi based on PROVIDER env var)
    const currentProvider = process.env.PROVIDER || 'replicate'
    const currentModel = process.env.MODEL || 'flux-kontext-max'
    console.log(`=== 开始调用${currentProvider === 'tuzi' ? '兔子AI' : 'Replicate'} API ===`)
    console.log(`使用模型: ${currentModel}`)
    
    const aiResult = await aiService.editImage({
      inputImage,
      prompt,
      aspectRatio
    })

    console.log(`${currentProvider === 'tuzi' ? '兔子AI' : 'Replicate'} API响应:`, aiResult)

    if (!aiResult.success) {
      console.error(`${currentProvider === 'tuzi' ? '兔子AI' : 'Replicate'} prediction error:`, aiResult.error)
      console.log(`=== ${currentProvider === 'tuzi' ? '兔子AI' : 'Replicate'}失败，无需退款（因为还未扣除积分） ===`)
      return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 })
    }
    
    // AI处理请求成功创建，现在扣除积分
    console.log(`=== ${currentProvider === 'tuzi' ? '兔子AI' : 'Replicate'}请求成功创建，现在扣除积分 ===`)
    const { data: deductResult, error: deductError } = await serviceSupabase
      .rpc('deduct_user_credits', { 
        p_user_id: user.id, 
        p_amount: 1 
      })
    
    console.log('积分扣除RPC调用结果:', { 
      deductResult, 
      deductError: deductError?.message,
      deductErrorDetails: deductError 
    })
    
    if (deductError) {
      console.error('积分扣除失败:', deductError)
      // 这里不返回错误，因为AI请求已经创建，继续处理
      console.log('警告：积分扣除失败，但继续处理请求')
    } else if (!deductResult) {
      console.error('积分扣除返回false')
      console.log('警告：积分扣除返回false，但继续处理请求')
    } else {
      console.log('积分扣除成功')
    }

    // 验证积分是否真的被扣除了
    await new Promise(resolve => setTimeout(resolve, 100)) // 100ms延迟确保事务提交
    const { data: afterCredits, error: afterError } = await serviceSupabase
      .from('ai_images_creator_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()
    
    console.log('扣除后积分验证:', { 
      beforeCredits: currentCredits?.credits,
      afterCredits: afterCredits?.credits,
      difference: (currentCredits?.credits || 0) - (afterCredits?.credits || 0),
      afterError: afterError?.message
    })
    
    console.log('=== AI图像编辑请求已提交并扣除积分 ===')
    console.log('预测ID:', aiResult.predictionId)
    console.log('当前Provider:', currentProvider)
    console.log('AI结果状态:', aiResult.status)
    
    // 对于Tuzi AI（同步返回），predictionId就是图片URL，可以立即显示
    // 对于Replicate（异步），返回predictionId供轮询使用
    const response = { 
      success: true, 
      predictionId: aiResult.predictionId,
      status: aiResult.status,
      userId: user.id,  // Include user ID for history saving
      // 如果是Tuzi AI，添加额外信息表示结果已完成
      ...(currentProvider === 'tuzi' && {
        completed: true,
        imageUrl: aiResult.predictionId, // Tuzi AI的predictionId就是图片URL
        output: aiResult.output
      })
    }
    
    console.log('=== 发送响应给前端 ===')
    console.log('响应内容:', {
      ...response,
      predictionId: response.predictionId?.substring(0, 50) + '...',
      imageUrl: response.imageUrl?.substring(0, 50) + '...'
    })
    
    if (currentProvider === 'tuzi') {
      console.log('🚀 Tuzi AI: 同步处理完成，前端应该立即显示结果')
    } else {
      console.log('⏳ Replicate: 异步处理，前端需要轮询状态')
    }
    
    // 异步处理存储逻辑（不阻塞响应）
    if (currentProvider === 'tuzi') {
      // 对于Tuzi AI，在后台异步存储图片和历史记录
      setImmediate(async () => {
        try {
          await storeImageInBackground(user?.id || '', aiResult.predictionId || '', prompt, aspectRatio, projectId, parentId)
        } catch (error) {
          console.error('后台存储失败:', error)
        }
      })
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('=== AI图像编辑异常 ===')
    console.error('错误详情:', error)
    
    return NextResponse.json({ error: 'Image editing failed' }, { status: 500 })
  }
} 