'use client'

import { usePathname } from 'next/navigation'

export default function WorldLayout({
  children,
  engagement,
}: {
  children: React.ReactNode
  engagement: React.ReactNode
}) {
  const pathname = usePathname()
  const isEngagementRoute = pathname.includes('/members') || pathname.includes('/edit')

  return (
    <>
      <div style={{ display: isEngagementRoute ? 'none' : 'block' }}>
        {children}
      </div>
      <div style={{ display: isEngagementRoute ? 'block' : 'none' }}>
        {engagement}
      </div>
    </>
  )
}
