"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface PaymentOrder {
  id: string
  out_trade_no: string
  trade_no: string | null
  amount: string
  credits_amount: number
  payment_type: string
  status: string
  param: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [retryingOrder, setRetryingOrder] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      console.log('=== 加载用户订单记录 ===')
      
      const response = await fetch('/api/user-orders')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('订单数据:', data)
      
      setOrders(data.orders || [])
      
    } catch (error) {
      console.error('加载订单记录失败:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            支付成功
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            待支付
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            支付失败
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            已取消
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  const getPaymentTypeIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'wxpay':
        return <Smartphone className="h-4 w-4 text-green-600" />
      case 'alipay':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentTypeName = (paymentType: string) => {
    switch (paymentType) {
      case 'wxpay':
        return '微信支付'
      case 'alipay':
        return '支付宝'
      default:
        return paymentType
    }
  }

  const handleRetryPayment = async (order: PaymentOrder) => {
    setRetryingOrder(order.out_trade_no)
    
    try {
      const response = await fetch('/api/payment/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outTradeNo: order.out_trade_no,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '重新生成支付链接失败')
      }

      const data = await response.json()
      
      if (data.paymentUrl) {
        // 跳转到支付页面
        window.location.href = data.paymentUrl
      } else {
        throw new Error(data.error || '获取支付链接失败')
      }
    } catch (error) {
      console.error('重新支付错误:', error)
      toast.error(`重新支付失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setRetryingOrder(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="text-gray-600">加载订单记录中...</div>
          </div>
        </div>
      </div>
    )
  }

  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(orders.length / itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/protected">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回创作空间
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">订单记录</h1>
            <p className="text-gray-600">查看您的支付订单历史</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单记录</h3>
          <p className="text-gray-500 mb-6">购买积分后，订单记录会显示在这里</p>
          <Link href="/pricing">
            <Button className="bg-purple-600 hover:bg-purple-700">
              购买积分
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Orders Cards */}
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                                     <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <div className="flex items-center space-x-2">
                         {getPaymentTypeIcon(order.payment_type)}
                         <span className="text-sm text-gray-600">
                           {getPaymentTypeName(order.payment_type)}
                         </span>
                       </div>
                       {getStatusBadge(order.status)}
                       {order.status === 'pending' && (
                         <Button
                           onClick={() => handleRetryPayment(order)}
                           disabled={retryingOrder === order.out_trade_no}
                           className="bg-purple-600 hover:bg-purple-700 h-6 px-2 text-xs"
                           size="sm"
                         >
                           {retryingOrder === order.out_trade_no ? (
                             <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                           ) : (
                             '继续支付'
                           )}
                         </Button>
                       )}
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-semibold text-purple-600">
                         ¥{order.amount}
                       </div>
                       <div className="text-sm text-gray-500">
                         {order.credits_amount} 积分
                       </div>
                     </div>
                   </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">订单号：</span>
                      <div className="font-mono text-xs mt-1 break-all">
                        {order.out_trade_no}
                      </div>
                    </div>
                    
                    {order.trade_no && (
                      <div>
                        <span className="text-gray-500">交易号：</span>
                        <div className="font-mono text-xs mt-1 break-all">
                          {order.trade_no}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-500">创建时间：</span>
                      <div className="mt-1">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    
                    {order.paid_at && (
                      <div>
                        <span className="text-gray-500">支付时间：</span>
                        <div className="mt-1">
                          {formatDate(order.paid_at)}
                        </div>
                      </div>
                    )}
                  </div>

                                     {/* Additional Info */}
                   {order.param && (
                     <div className="mt-4 pt-4 border-t border-gray-100">
                       <span className="text-gray-500 text-sm">备注：</span>
                       <div className="text-sm text-gray-700 mt-1">
                         {order.param}
                       </div>
                     </div>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({length: totalPages}, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 