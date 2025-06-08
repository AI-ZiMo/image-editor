import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get project image chain using the database function
    const { data: images, error: imagesError } = await supabase
      .rpc('get_project_image_chain', { 
        p_user_id: user.id,
        p_project_id: projectId 
      })
    
    if (imagesError) {
      console.error('Error fetching project images:', imagesError)
      return NextResponse.json({ error: 'Failed to fetch project images' }, { status: 500 })
    }
    
    return NextResponse.json({ images: images || [] })
  } catch (error) {
    console.error('Error in project-images API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 