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
    
    // Get user projects using the database function
    const { data: projects, error: projectsError } = await supabase
      .rpc('get_user_projects', { p_user_id: user.id })
    
    if (projectsError) {
      console.error('Error fetching user projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
    
    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error('Error in user-history API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 