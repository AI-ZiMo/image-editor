import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const filePath = `${user.id}/${fileName}` // 使用用户ID作为文件夹

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