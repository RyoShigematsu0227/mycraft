'use client'

import { usePathname } from 'next/navigation'

export default function UserLayout({
  children,
  engagement,
}: {
  children: React.ReactNode
  engagement: React.ReactNode
}) {
  const pathname = usePathname()
  const isEngagementRoute = pathname.includes('/followers') || pathname.includes('/following')

  return isEngagementRoute ? engagement : children
}
