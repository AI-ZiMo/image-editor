import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload file to Replicate
    const replicateFormData = new FormData()
    replicateFormData.append('content', file)

    const uploadResponse = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: replicateFormData,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('Replicate upload error:', error)
      return NextResponse.json({ error: 'Failed to upload to Replicate' }, { status: 500 })
    }

    const uploadResult = await uploadResponse.json()
    
    return NextResponse.json({ 
      success: true, 
      fileUrl: uploadResult.urls.get,
      fileId: uploadResult.id 
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
} 