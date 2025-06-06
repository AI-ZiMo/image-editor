import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { inputImage, prompt, aspectRatio = "match_input_image" } = await request.json()
    
    if (!inputImage || !prompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Create prediction using Replicate API
    const predictionResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          aspect_ratio: aspectRatio,
          input_image: inputImage,
          output_format: "png",
          prompt: prompt,
          safety_tolerance: 2
        }
      }),
    })

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text()
      console.error('Replicate prediction error:', error)
      return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 })
    }

    const prediction = await predictionResponse.json()
    
    return NextResponse.json({ 
      success: true, 
      predictionId: prediction.id,
      status: prediction.status 
    })
    
  } catch (error) {
    console.error('Image edit error:', error)
    return NextResponse.json({ error: 'Image editing failed' }, { status: 500 })
  }
} 