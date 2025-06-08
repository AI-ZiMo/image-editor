import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  let user: any = null
  
  try {
    const { inputImage, prompt, aspectRatio = "match_input_image" } = await request.json()
    
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

    // Create prediction using Replicate API
    console.log('=== 开始调用Replicate API ===')
    const predictionResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          aspect_ratio: aspectRatio,
          input_image: inputImage,
          output_format: "png",
          prompt: prompt,
          safety_tolerance: 2
        }
      }),
    })

    console.log('Replicate API响应状态:', predictionResponse.status)

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text()
      console.error('Replicate prediction error:', error)
      console.log('=== Replicate失败，无需退款（因为还未扣除积分） ===')
      return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 })
    }

    const prediction = await predictionResponse.json()
    
    // AI处理请求成功创建，现在扣除积分
    console.log('=== Replicate请求成功创建，现在扣除积分 ===')
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
      // 这里不返回错误，因为Replicate请求已经创建，继续处理
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
    console.log('预测ID:', prediction.id)
    
    return NextResponse.json({ 
      success: true, 
      predictionId: prediction.id,
      status: prediction.status,
      userId: user.id  // Include user ID for history saving
    })
    
  } catch (error) {
    console.error('=== AI图像编辑异常 ===')
    console.error('错误详情:', error)
    
    return NextResponse.json({ error: 'Image editing failed' }, { status: 500 })
  }
} 