"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"

interface PaymentResultModalProps {
  isOpen: boolean
  outTradeNo: string | null
  onClose: () => void
  onSuccess?: (creditsAmount: number) => void
}

type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'

export function PaymentResultModal({ 
  isOpen, 
  outTradeNo, 
  onClose, 
  onSuccess 
}: PaymentResultModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('pending')
  const [creditsAmount, setCreditsAmount] = useState<number>(0)
  const [amount, setAmount] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState(30)
  const [isPolling, setIsPolling] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 清理定时器
  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // 查询支付状态
  const checkPaymentStatus = async () => {
    if (!outTradeNo) return

    try {
      const response = await fetch(`/api/payment/status?out_trade_no=${outTradeNo}`)
      if (!response.ok) {
        throw new Error('查询支付状态失败')
      }

      const data = await response.json()
      console.log('支付状态查询结果:', data)

      if (data.success) {
        if (data.status === 'success') {
          setStatus('success')
          setCreditsAmount(data.creditsAmount)
          setAmount(data.amount)
          clearTimers()
          onSuccess?.(data.creditsAmount)
        } else if (data.status === 'failed') {
          setStatus('failed')
          clearTimers()
        } else if (data.status === 'cancelled') {
          setStatus('cancelled')
          clearTimers()
        }
        // pending状态继续轮询
      }
    } catch (error) {
      console.error('查询支付状态错误:', error)
    }
  }

  // 开始轮询
  useEffect(() => {
    if (isOpen && outTradeNo && !isPolling) {
      setIsPolling(true)
      setStatus('pending')
      setRemainingTime(30)

      // 立即检查一次
      checkPaymentStatus()

      // 每2秒检查一次支付状态
      intervalRef.current = setInterval(checkPaymentStatus, 2000)

      // 30秒后超时
      timeoutRef.current = setTimeout(() => {
        setStatus('timeout')
        clearTimers()
      }, 30000)

      // 倒计时
      const countdownInterval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        clearTimers()
        clearInterval(countdownInterval)
        setIsPolling(false)
      }
    }
  }, [isOpen, outTradeNo])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  const handleClose = () => {
    clearTimers()
    setIsPolling(false)
    onClose()
  }

  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />,
          title: '正在验证支付结果',
          message: `请稍候，正在验证您的支付状态...\n剩余时间：${remainingTime}秒`,
          buttonText: '取消',
          buttonVariant: 'outline' as const
        }
      
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-600" />,
          title: '支付成功！',
          message: `恭喜！您已成功充值 ${creditsAmount} 积分\n支付金额：¥${amount}\n积分已自动到账，可以开始创作了！`,
          buttonText: '开始创作',
          buttonVariant: 'default' as const
        }
      
      case 'failed':
        return {
          icon: <XCircle className="h-12 w-12 text-red-600" />,
          title: '支付失败',
          message: '很抱歉，您的支付未能成功完成。\n如果您已经付款，请联系客服处理。',
          buttonText: '重新充值',
          buttonVariant: 'default' as const
        }
      
      case 'cancelled':
        return {
          icon: <XCircle className="h-12 w-12 text-gray-600" />,
          title: '支付已取消',
          message: '您已取消了此次支付。\n如需充值，请重新发起支付。',
          buttonText: '重新充值',
          buttonVariant: 'default' as const
        }
      
      case 'timeout':
        return {
          icon: <Clock className="h-12 w-12 text-orange-600" />,
          title: '验证超时',
          message: '支付状态验证超时。\n如果您已完成支付，积分会在稍后自动到账。\n如有疑问，请联系客服。',
          buttonText: '确定',
          buttonVariant: 'default' as const
        }
      
      default:
        return {
          icon: <Clock className="h-12 w-12 text-gray-600" />,
          title: '未知状态',
          message: '支付状态未知，请联系客服。',
          buttonText: '确定',
          buttonVariant: 'default' as const
        }
    }
  }

  const statusContent = getStatusContent()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4 py-6">
          {statusContent.icon}
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{statusContent.title}</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {statusContent.message}
            </p>
          </div>
          
          <Button
            onClick={handleClose}
            variant={statusContent.buttonVariant}
            className="w-full"
          >
            {statusContent.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 