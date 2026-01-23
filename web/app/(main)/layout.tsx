'use client'

import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
