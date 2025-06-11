import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

// 仅用于测试的API端点 - 生产环境应该删除
export async function POST(request: NextRequest) {
  try {
    const { amount = 10 } = await request.json()
    
    // Get the current user
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('用户认证失败:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 使用 service role 客户端添加积分
    const serviceSupabase = await createServiceRoleClient()
    const { error: addError } = await serviceSupabase
      .rpc('add_user_credits', { 
        p_user_id: user.id, 
        p_amount: amount 
      })
    
    if (addError) {
      console.error('添加积分失败:', addError)
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
    }

    // 获取更新后的积分
    const { data: creditsData, error: creditsError } = await serviceSupabase
      .from('ai_images_creator_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditsError) {
      console.error('获取积分失败:', creditsError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `成功添加 ${amount} 个积分`,
      totalCredits: creditsData?.credits || 0
    })
    
  } catch (error) {
    console.error('添加积分异常:', error)
    return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
  }
}