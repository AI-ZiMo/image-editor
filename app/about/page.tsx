"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"



export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthButton={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">关于我们</h1>
              <p className="text-gray-600">了解小猫AI图片编辑器</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div 
          className="rounded-2xl p-8 mb-12"
          style={{
            background: 'linear-gradient(to right, #9333ea, #2563eb)',
            minHeight: '200px'
          }}
        >
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">让AI为您的创意插上翅膀</h2>
            <p className="text-xl text-white leading-relaxed drop-shadow" style={{ opacity: 0.9 }}>
              小猫AI图片编辑器是一款基于最新AI技术的智能图片编辑工具，
              致力于为每一位用户提供专业、便捷、高质量的图片编辑服务。
              无论您是设计师、内容创作者，还是普通用户，都能轻松创作出令人惊艳的作品。
            </p>
          </div>
        </div>



        {/* Founder Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">创始人介绍</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src="https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesWechatIMG127.jpg"
                    alt="创始人子默"
                    width={200}
                    height={200}
                    className="rounded-full object-cover border-4 border-purple-200"
                  />
                  <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                    Founder
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">子默</h3>
                <p className="text-purple-600 font-medium mb-4">创始人 & 产品负责人</p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  资深AI产品开发者，专注于人工智能在创意领域的应用。
                  致力于让AI技术更好地服务于普通用户的创作需求，
                  相信技术应该降低创作门槛，让每个人都能享受创作的乐趣。
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">添加微信咨询</p>
                    <p className="text-xs text-gray-400">备注：小猫AI</p>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-2">
                    <Image
                      src="https://aibuilder.oss-cn-hangzhou.aliyuncs.com/imagesWechatIMG129.jpg"
                      alt="创始人微信二维码"
                      width={120}
                      height={120}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>




      </div>
    </div>
  )
} 