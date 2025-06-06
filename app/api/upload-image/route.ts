import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting upload process...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Create Supabase client
    const supabase = await createServerClient()
    console.log('Supabase client created')

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User auth error:', userError)
      return NextResponse.json({ error: 'Auth error: ' + userError.message }, { status: 401 })
    }
    
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Generate unique filename with user folder
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${user.id}/${fileName}` // 使用用户ID作为文件夹

    console.log('Generated file path:', filePath)

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log('File converted to buffer, size:', uint8Array.length)

    // First, check if bucket exists and is accessible
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return NextResponse.json({ 
        error: 'Storage configuration error: ' + bucketsError.message 
      }, { status: 500 })
    }

    console.log('Available buckets:', buckets?.map(b => b.name))

    // Upload to Supabase Storage
    console.log('Starting storage upload...')
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ 
        error: 'Storage upload failed: ' + error.message,
        details: error
      }, { status: 500 })
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    console.log('Public URL generated:', publicUrl)
    
    return NextResponse.json({ 
      success: true, 
      fileUrl: publicUrl,
      filePath: filePath
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    
    // Ensure we always return JSON
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 