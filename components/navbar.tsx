"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, User, LogOut, Clock, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  showAuthButton?: boolean
  user?: any
}

export function Navbar({ showAuthButton = true, user }: NavbarProps) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    if (!user) {
      const checkUser = async () => {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setCurrentUser(data.user)
      }
      checkUser()
    }
  }, [user])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105 duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-2 rounded-lg shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">小猫AI图片编辑</div>
              <div className="text-xs text-gray-500">代替PS的AI图片编辑工具</div>
            </div>
          </Link>
          
          {/* 居中的导航栏 */}
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
            >
              <span className="relative z-10">首页</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
            </Link>
            {currentUser && (
              <>
                <Link 
                  href="/protected" 
                  className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
                >
                  <span className="relative z-10">创作空间</span>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
                </Link>
                <Link 
                  href="/protected/history" 
                  className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
                >
                  <span className="relative z-10">历史记录</span>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
                </Link>
                <Link 
                  href="/protected/orders" 
                  className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
                >
                  <span className="relative z-10">订单记录</span>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
                </Link>
              </>
                            )}
            <Link 
              href="/#pricing" 
              className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
            >
              <span className="relative z-10">定价</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
            >
              <span className="relative z-10">关于我们</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
            </Link>
            <Link 
              href="/#faq" 
              className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
            >
              <span className="relative z-10">常见问题</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
            </Link>

          </nav>
          
          {/* 右侧用户信息或登录按钮 */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-purple-50">
                    <div className="bg-purple-100 p-1 rounded-full">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                      {currentUser.email || currentUser.phone || '用户'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{currentUser.email || currentUser.phone || '用户'}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.user_metadata?.full_name || (currentUser.phone ? '手机用户' : '邮箱用户')}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/protected')}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    创作空间
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/protected/history')}>
                    <Clock className="mr-2 h-4 w-4" />
                    历史记录
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/protected/orders')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    订单记录
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/#pricing')}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    积分定价
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              showAuthButton && (
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => router.push('/login')}>
                  登录/注册
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 