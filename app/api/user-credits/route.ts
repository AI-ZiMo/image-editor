import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user credits
    const { data: credits, error: creditsError } = await supabase
      .from('ai_images_creator_credits')
      .select('credits')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (creditsError) {
      console.error('Error fetching credits:', creditsError)
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
    }
    
    // Return 0 if no credits record exists, otherwise return the actual credits
    return NextResponse.json({ credits: credits?.credits || 0 })
  } catch (error) {
    console.error('Error in user-credits API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 