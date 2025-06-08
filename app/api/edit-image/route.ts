import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  let user: any = null
  
  try {
    const { inputImage, prompt, aspectRatio = "match_input_image" } = await request.json()
    
    if (!inputImage || !prompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get the current user
    const supabase = await createServerClient()
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
    user = authUser
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client to deduct credits
    const serviceSupabase = await createServiceRoleClient()
    const { data: deductResult, error: deductError } = await serviceSupabase
      .rpc('deduct_user_credits', { 
        p_user_id: user.id, 
        p_amount: 1 
      })
    
    if (deductError) {
      console.error('Error deducting credits:', deductError)
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }
    
    if (!deductResult) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
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
      status: prediction.status,
      userId: user.id  // Include user ID for history saving
    })
    
  } catch (error) {
    console.error('Image edit error:', error)
    
    // If error occurred after deducting credits, refund them
    if (user?.id) {
      try {
        const serviceSupabase = await createServiceRoleClient()
        await serviceSupabase.rpc('add_user_credits', { 
          p_user_id: user.id, 
          p_amount: 1 
        })
        console.log('Credits refunded due to error')
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
    
    return NextResponse.json({ error: 'Image editing failed' }, { status: 500 })
  }
} 