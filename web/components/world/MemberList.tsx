'use client'

import { UserCard } from '@/components/user'
import { EmptyState } from '@/components/ui'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface MemberListProps {
  members: User[]
  ownerId: string
  currentUserId?: string
}

export default function MemberList({ members, ownerId, currentUserId }: MemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
        title="まだメンバーがいません"
      />
    )
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {members.map((member) => (
        <div key={member.id} className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <UserCard
                user={member}
                currentUserId={currentUserId}
                showBio={false}
                showFollowButton={true}
              />
            </div>
            {member.id === ownerId && (
              <span className="rounded bg-accent-light px-2 py-1 text-xs font-medium text-accent">
                オーナー
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
