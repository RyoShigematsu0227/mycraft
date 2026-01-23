import SetupForm from '@/components/auth/SetupForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in, redirect to login
  if (!user) {
    redirect('/login')
  }

  // Check if profile already exists
  const { data: profile } = await supabase
    .from('users')
    .select('user_id')
    .eq('id', user.id)
    .single()

  // Profile already exists, redirect to home
  if (profile) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SetupForm />
    </div>
  )
}
