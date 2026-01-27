'use client'

import { usePathname } from 'next/navigation'

export default function PostLayout({
  children,
  engagement,
}: {
  children: React.ReactNode
  engagement: React.ReactNode
}) {
  const pathname = usePathname()
  const isEngagementRoute = pathname.includes('/likes') || pathname.includes('/reposts')

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
