import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 签名算法函数
function generateSign(params: Record<string, string>, key: string): string {
  // 1. 过滤掉空值、sign、sign_type参数
  const filteredParams: [string, string][] = []
  
  for (const [paramKey, value] of Object.entries(params)) {
    if (value && paramKey !== 'sign' && paramKey !== 'sign_type') {
      filteredParams.push([paramKey, value])
    }
  }
  
  // 2. 按参数名ASCII码排序
  filteredParams.sort()
  
  // 3. 拼接成URL键值对格式
  const prestr = filteredParams
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  
  // 4. 拼接密钥并MD5加密
  const signString = prestr + key
  return crypto.createHash('md5').update(signString).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { outTradeNo } = await request.json()
    
    // 验证参数
    if (!outTradeNo) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 查询订单信息
    const { data: orderData, error: orderError } = await supabase
      .from('ai_images_creator_payments')
      .select('*')
      .eq('out_trade_no', outTradeNo)
      .eq('user_id', user.id)
      .single()
    
    if (orderError || !orderData) {
      console.error('订单不存在:', outTradeNo, orderError)
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }
    
    // 检查订单状态
    if (orderData.status !== 'pending') {
      return NextResponse.json(
        { error: '订单状态不正确，无法重新支付' },
        { status: 400 }
      )
    }
    
    // 获取环境变量
    const pid = process.env.ZPAY_PID
    const key = process.env.ZPAY_KEY
    
    if (!pid || !key) {
      console.error('支付配置错误: ZPAY_PID 或 ZPAY_KEY 未设置')
      return NextResponse.json(
        { error: '支付服务配置错误' },
        { status: 500 }
      )
    }
    
    // 构建支付参数
    const paymentParams = {
      name: `积分${orderData.credits_amount}`,
      money: orderData.amount.toString(),
      type: orderData.payment_type,
      out_trade_no: orderData.out_trade_no,
      notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/protected?payment_success=1&out_trade_no=${orderData.out_trade_no}`,
      pid: pid,
      param: `out_trade_no:${orderData.out_trade_no}`,
      sign_type: 'MD5'
    }
    
    // 生成签名
    const sign = generateSign(paymentParams, key)
    
    // 构建最终的支付URL
    const paymentUrl = 'https://zpayz.cn/submit.php'
    const urlParams = new URLSearchParams({
      ...paymentParams,
      sign
    })
    
    const finalPaymentUrl = `${paymentUrl}?${urlParams.toString()}`
    
    console.log('=== 重新生成支付链接 ===')
    console.log('订单号:', outTradeNo)
    console.log('支付金额:', orderData.amount)
    console.log('支付方式:', orderData.payment_type)
    
    return NextResponse.json({
      success: true,
      paymentUrl: finalPaymentUrl,
      outTradeNo: orderData.out_trade_no,
      amount: orderData.amount,
      credits: orderData.credits_amount
    })
    
  } catch (error) {
    console.error('重新生成支付链接错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 