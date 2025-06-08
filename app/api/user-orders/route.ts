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
    
    // Get user payment orders
    const { data: orders, error: ordersError } = await supabase
      .from('ai_images_creator_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (ordersError) {
      console.error('Error fetching user orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
    
    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Error in user-orders API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 