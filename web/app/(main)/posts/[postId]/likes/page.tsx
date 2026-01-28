'use client'

import { useParams } from 'next/navigation'
import { EngagementTabs } from '@/components/post'

export default function PostLikesPage() {
  const params = useParams()
  const postId = params.postId as string

  return <EngagementTabs postId={postId} initialTab="likes" />
}
