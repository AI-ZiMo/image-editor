import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const predictionId = searchParams.get('id')
    
    if (!predictionId) {
      return NextResponse.json({ error: 'Prediction ID required' }, { status: 400 })
    }

    // Check prediction status using AI service
    const result = await aiService.checkPredictionStatus(predictionId)
    
    if (!result.success) {
      console.error('AI status check error:', result.error)
      return NextResponse.json({ error: 'Failed to check prediction status' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      status: result.status,
      output: result.output,
      error: result.error 
    })
    
  } catch (error) {
    console.error('Prediction check error:', error)
    return NextResponse.json({ error: 'Failed to check prediction' }, { status: 500 })
  }
} 