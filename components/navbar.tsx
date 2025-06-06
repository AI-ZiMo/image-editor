"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NavbarProps {
  showAuthButton?: boolean
}

export function Navbar({ showAuthButton = true }: NavbarProps) {
  const router = useRouter()

  return (
    <header className="bg-white shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105 duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-2 rounded-lg shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">魔图工坊</div>
              <div className="text-xs text-gray-500">AI图片风格转换</div>
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
            <a 
              href="#" 
              className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
            >
              <span className="relative z-10">关于我们</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-purple-600 relative transition-all duration-300 ease-in-out group"
            >
              <span className="relative z-10">常见问题</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
            </a>
          </nav>
          
          {showAuthButton && (
            <Button className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => router.push('/login')}>
              登录/注册
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 