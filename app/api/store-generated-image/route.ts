import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, userId } = await request.json()
    
    console.log('=== store-generated-image API 被调用 ===')
    console.log('imageUrl存在:', !!imageUrl)
    console.log('userId参数:', userId)
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }

    let user: { id: string } | null = null
    let supabase: any

    if (userId && userId.trim() !== '') {
      // 服务器端调用，直接使用传入的userId和service role client
      user = { id: userId }
      supabase = await createServiceRoleClient()
      console.log('🔧 服务器端调用store-generated-image，用户ID:', userId)
      console.log('使用service role client')
    } else {
      // 客户端调用，需要身份验证
      console.log('👤 客户端调用store-generated-image，开始身份验证')
      supabase = await createServerClient()
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !authUser) {
        console.error('身份验证失败:', userError)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser
      console.log('身份验证成功，用户ID:', authUser.id)
    }

    if (!user) {
      console.error('用户对象为空')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Download image from Replicate
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
    }

    // Get image data
    const imageBuffer = await imageResponse.arrayBuffer()
    const uint8Array = new Uint8Array(imageBuffer)

    // Generate unique filename with user folder
    const fileName = `generated-${Date.now()}-${Math.random().toString(36).substring(2)}.png`
    const filePath = `${user!.id}/${fileName}` // 使用用户ID作为文件夹

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, uint8Array, {
        contentType: 'image/png',
        upsert: false
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ error: 'Failed to store image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    return NextResponse.json({ 
      success: true, 
      storedUrl: publicUrl,
      filePath: filePath
    })
    
  } catch (error) {
    console.error('Store image error:', error)
    return NextResponse.json({ error: 'Failed to store image' }, { status: 500 })
  }
} 