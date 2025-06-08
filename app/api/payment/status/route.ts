import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const outTradeNo = searchParams.get('out_trade_no')
    
    if (!outTradeNo) {
      return NextResponse.json(
        { error: '缺少订单号参数' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 查询支付状态
    const { data: paymentStatus, error: statusError } = await supabase
      .rpc('get_payment_status', {
        p_user_id: user.id,
        p_out_trade_no: outTradeNo
      })
    
    if (statusError) {
      console.error('查询支付状态失败:', statusError)
      return NextResponse.json(
        { error: '查询支付状态失败' },
        { status: 500 }
      )
    }
    
    if (!paymentStatus || paymentStatus.length === 0) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }
    
    const status = paymentStatus[0]
    
    return NextResponse.json({
      success: true,
      status: status.status,
      creditsAmount: status.credits_amount,
      amount: status.amount,
      paidAt: status.paid_at
    })
    
  } catch (error) {
    console.error('查询支付状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 