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

  return isEngagementRoute ? engagement : children
}
