'use client'

import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { PostModal } from '@/components/post'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1 overflow-x-hidden pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
      <PostModal />
    </div>
  )
}
