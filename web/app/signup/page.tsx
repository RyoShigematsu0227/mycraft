import SignupForm from '@/components/auth/SignupForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if profile exists
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      redirect('/setup')
    }
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignupForm />
    </div>
  )
}
