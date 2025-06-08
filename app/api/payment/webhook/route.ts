import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 验证签名函数（与生成签名逻辑相同）
function verifySign(params: Record<string, string>, key: string, expectedSign: string): boolean {
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
  const calculatedSign = crypto.createHash('md5').update(signString).digest('hex')
  
  return calculatedSign === expectedSign
}

export async function GET(request: NextRequest) {
  return handlePaymentNotification(request)
}

export async function POST(request: NextRequest) {
  return handlePaymentNotification(request)
}

async function handlePaymentNotification(request: NextRequest) {
  try {
    console.log('=== 收到支付回调通知 ===')
    console.log('请求方法:', request.method)
    console.log('请求URL:', request.url)
    
    // 获取参数（支持GET和POST）
    let params: Record<string, string> = {}
    
    if (request.method === 'GET') {
      const url = new URL(request.url)
      for (const [key, value] of url.searchParams.entries()) {
        params[key] = value
      }
    } else {
      // POST请求
      const body = await request.text()
      if (body) {
        // 尝试解析JSON
        try {
          params = JSON.parse(body)
        } catch {
          // 如果不是JSON，尝试解析URL编码
          const urlParams = new URLSearchParams(body)
          for (const [key, value] of urlParams.entries()) {
            params[key] = value
          }
        }
      }
    }

    // 从param字段解析out_trade_no (格式: "out_trade_no:订单号,credits:积分数")
    if (params.param && !params.out_trade_no) {
      const paramPairs = params.param.split(',')
      for (const pair of paramPairs) {
        const [key, value] = pair.split(':')
        if (key === 'out_trade_no') {
          params.out_trade_no = value
          break
        }
      }
    }
    
    // 如果缺少sign_type参数，默认设置为MD5
    if (!params.sign_type) {
      params.sign_type = 'MD5'
    }
    
    console.log('回调参数:', params)
    
    // 验证必要参数
    const requiredParams = ['pid', 'out_trade_no', 'trade_no', 'money', 'trade_status', 'sign']
    for (const param of requiredParams) {
      if (!params[param]) {
        console.error(`缺少必要参数: ${param}`)
        return new NextResponse('缺少必要参数', { status: 400 })
      }
    }
    
    // 获取环境变量
    const expectedPid = process.env.ZPAY_PID
    const key = process.env.ZPAY_KEY
    
    if (!expectedPid || !key) {
      console.error('支付配置错误: ZPAY_PID 或 ZPAY_KEY 未设置')
      return new NextResponse('服务器配置错误', { status: 500 })
    }
    
    // 验证商户ID
    if (params.pid !== expectedPid) {
      console.error('商户ID验证失败')
      return new NextResponse('商户ID验证失败', { status: 400 })
    }
    
    // 验证签名
    if (!verifySign(params, key, params.sign)) {
      console.error('签名验证失败')
      console.error('预期参数:', params)
      return new NextResponse('签名验证失败', { status: 400 })
    }
    
    // 使用service_role客户端进行数据库操作
    const supabase = await createServerClient()
    
    // 查询原始订单信息进行金额验证
    const { data: existingOrder, error: queryError } = await supabase
      .from('ai_images_creator_payments')
      .select('amount, credits_amount, status, user_id')
      .eq('out_trade_no', params.out_trade_no)
      .single()
    
    if (queryError || !existingOrder) {
      console.error('订单不存在:', params.out_trade_no, queryError)
      return new NextResponse('订单不存在', { status: 404 })
    }
    
    // 验证金额
    const receivedAmount = parseFloat(params.money)
    const expectedAmount = parseFloat(existingOrder.amount.toString())
    
    if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
      console.error('金额验证失败:', {
        received: receivedAmount,
        expected: expectedAmount
      })
      return new NextResponse('金额验证失败', { status: 400 })
    }
    
    // 检查订单是否已经处理过
    if (existingOrder.status === 'success') {
      console.log('订单已经处理过，返回成功')
      return new NextResponse('success')
    }
    
    // 根据支付状态更新订单
    let newStatus = 'failed'
    if (params.trade_status === 'TRADE_SUCCESS') {
      newStatus = 'success'
    }
    
    console.log('更新支付状态:', {
      out_trade_no: params.out_trade_no,
      trade_no: params.trade_no,
      status: newStatus,
      amount: receivedAmount
    })
    
    // 更新支付状态并增加积分
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_payment_status', {
        p_out_trade_no: params.out_trade_no,
        p_trade_no: params.trade_no,
        p_status: newStatus
      })
    
    if (updateError) {
      console.error('更新支付状态失败:', updateError)
      return new NextResponse('更新支付状态失败', { status: 500 })
    }
    
    if (newStatus === 'success') {
      console.log('=== 支付成功处理完成 ===')
      console.log('订单号:', params.out_trade_no)
      console.log('支付平台订单号:', params.trade_no)
      console.log('充值积分:', existingOrder.credits_amount)
      console.log('支付金额:', receivedAmount)
    }
    
    // 返回success告知支付平台处理成功
    return new NextResponse('success')
    
  } catch (error) {
    console.error('支付回调处理错误:', error)
    return new NextResponse('处理失败', { status: 500 })
  }
} 