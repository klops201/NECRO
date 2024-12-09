// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { message, unique_id } = await request.json()

    const { data, error } = await supabase
      .from('conversations')
      .insert([
        { 
          content: message, // zmiana z message na content
          unique_id,
          upvotes: 0,
          mood: 'default',
          philosophical_level: Math.floor(Math.random() * 10) + 1,
          dimension_state: 'stable',
          theme: 'quantum'
        }
      ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving to Supabase:', error)
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
