'use client'

import { useParams } from 'next/navigation'
import FollowTabs from '@/components/user/FollowTabs'

export default function FollowersPage() {
  const params = useParams()
  const userId = params.userId as string

  return <FollowTabs userId={userId} initialTab="followers" />
}
