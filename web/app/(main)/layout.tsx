'use client'

import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { PostModal } from '@/components/post'
import { WorldModal } from '@/components/world'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
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
