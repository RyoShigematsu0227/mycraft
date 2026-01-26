import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'メールアドレス/ユーザーIDとパスワードを入力してください' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let email = identifier

    // If identifier doesn't contain @, it might be a user_id
    if (!identifier.includes('@')) {
      // Look up the user by user_id to get their auth id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', identifier)
        .single()

      if (!userData) {
        return NextResponse.json(
          { error: 'ユーザーIDまたはパスワードが正しくありません' },
          { status: 401 }
        )
      }

      // Get the user's email from auth using admin client
      // We need to use the service role for this
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userData.id)

      if (authError || !authUser?.user?.email) {
        return NextResponse.json(
          { error: 'ユーザーIDまたはパスワードが正しくありません' },
          { status: 401 }
        )
      }

      email = authUser.user.email
    }

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'メールアドレス/ユーザーIDまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // Check if user has completed profile setup
    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('user_id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        return NextResponse.json({ redirectTo: '/setup' })
      }
    }

    return NextResponse.json({ redirectTo: '/' })
  } catch {
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}
