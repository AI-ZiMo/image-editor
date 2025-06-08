import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      projectId, 
      parentId, 
      imageUrl, 
      storagePath, 
      prompt, 
      style, 
      aspectRatio = 'match_input_image',
      isOriginal = false 
    } = await request.json()
    
    if (!userId || !imageUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const serviceSupabase = await createServiceRoleClient()
    
    if (isOriginal) {
      // Create new project for original image
      const { data: newProjectId, error: projectError } = await serviceSupabase
        .rpc('create_new_project', {
          p_user_id: userId,
          p_image_url: imageUrl,
          p_storage_path: storagePath,
          p_project_name: null
        })
      
      if (projectError) {
        console.error('Error creating project:', projectError)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        projectId: newProjectId 
      })
    } else {
      // Add generated image to existing project
      const { data: newImageId, error: imageError } = await serviceSupabase
        .rpc('add_generated_image', {
          p_user_id: userId,
          p_project_id: projectId,
          p_parent_id: parentId,
          p_image_url: imageUrl,
          p_storage_path: storagePath,
          p_prompt: prompt,
          p_style: style,
          p_aspect_ratio: aspectRatio
        })
      
      if (imageError) {
        console.error('Error adding generated image:', imageError)
        return NextResponse.json({ error: 'Failed to save image history' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        imageId: newImageId 
      })
    }
    
  } catch (error) {
    console.error('Error in save-image-history API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 