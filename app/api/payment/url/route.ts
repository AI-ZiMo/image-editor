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
    const { credits, amount, paymentType = 'alipay' } = await request.json()
    
    // 验证参数
    if (!credits || !amount || credits <= 0 || amount <= 0) {
      return NextResponse.json(
        { error: '参数错误：积分数量和金额必须大于0' },
        { status: 400 }
      )
    }
    
    if (!['alipay', 'wxpay'].includes(paymentType)) {
      return NextResponse.json(
        { error: '不支持的支付方式' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    
    // 创建支付订单
    const { data: orderData, error: orderError } = await supabase
      .rpc('create_payment_order', {
        p_user_id: user.id,
        p_amount: amount,
        p_credits_amount: credits,
        p_payment_type: paymentType
      })
    
    if (orderError || !orderData || orderData.length === 0) {
      console.error('创建支付订单失败:', orderError)
      return NextResponse.json(
        { error: '创建支付订单失败' },
        { status: 500 }
      )
    }
    
    const { out_trade_no } = orderData[0]
    
    // 构建支付参数
    const paymentParams = {
      name: `积分${credits}`,
      money: amount.toString(),
      type: paymentType,
      out_trade_no: out_trade_no,
      notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/protected?payment_success=1&out_trade_no=${out_trade_no}`,
      pid: pid,
      param: `out_trade_no:${out_trade_no},credits:${credits}`,
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
    
    console.log('=== 支付订单创建成功 ===')
    console.log('订单号:', out_trade_no)
    console.log('充值积分:', credits)
    console.log('支付金额:', amount)
    console.log('支付方式:', paymentType)
    
    return NextResponse.json({
      success: true,
      paymentUrl: finalPaymentUrl,
      outTradeNo: out_trade_no,
      amount,
      credits
    })
    
  } catch (error) {
    console.error('支付URL生成错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 