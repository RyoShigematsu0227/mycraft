'use client'

import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
