import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const predictionId = searchParams.get('id')
    
    if (!predictionId) {
      return NextResponse.json({ error: 'Prediction ID required' }, { status: 400 })
    }

    // Check prediction status
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    })

    if (!statusResponse.ok) {
      const error = await statusResponse.text()
      console.error('Replicate status check error:', error)
      return NextResponse.json({ error: 'Failed to check prediction status' }, { status: 500 })
    }

    const prediction = await statusResponse.json()
    
    return NextResponse.json({ 
      success: true, 
      status: prediction.status,
      output: prediction.output,
      error: prediction.error 
    })
    
  } catch (error) {
    console.error('Prediction check error:', error)
    return NextResponse.json({ error: 'Failed to check prediction' }, { status: 500 })
  }
} 