'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { PostModal } from '@/components/post'
import { WorldModal } from '@/components/world'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [profileChecked, setProfileChecked] = useState(false)

  // Check if authenticated user has a profile
  useEffect(() => {
    if (isLoading) return

    const checkProfile = async () => {
      if (!user) {
        setProfileChecked(true)
        return
      }

      const supabase = createClient()
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // User is authenticated but has no profile, redirect to setup
        router.replace('/setup')
        return
      }

      setProfileChecked(true)
    }

    checkProfile()
  }, [user, isLoading, router])

  // Show loading while checking profile
  if (!profileChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
      <PostModal />
      <WorldModal />
    </div>
  )
}
