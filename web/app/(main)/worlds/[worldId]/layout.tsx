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

  return isEngagementRoute ? engagement : children
}
