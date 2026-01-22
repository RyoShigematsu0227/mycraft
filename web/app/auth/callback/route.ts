import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has completed profile setup
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('user_id')
          .eq('id', user.id)
          .single()

        // If no profile exists, redirect to profile setup
        if (!profile) {
          return NextResponse.redirect(`${origin}/setup`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login page on error
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
