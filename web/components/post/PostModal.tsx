'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { usePostModalStore } from '@/lib/stores'
import { useAuth } from '@/hooks/useAuth'
import PostForm from './PostForm'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

async function fetchUserWorlds(userId: string): Promise<World[]> {
  const supabase = createClient()
  const { data: memberships } = await supabase
    .from('world_members')
    .select('world:worlds!world_members_world_id_fkey(*)')
    .eq('user_id', userId)

  return memberships?.map((m) => m.world).filter((w): w is World => w !== null) || []
}

export default function PostModal() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const { isOpen, defaultWorldId, closeModal } = usePostModalStore()
  const modalRef = useRef<HTMLDivElement>(null)

  // Fetch user's worlds with SWR
  const { data: worlds = [], isLoading } = useSWR(
    authUser?.id && isOpen ? ['userWorlds', authUser.id] : null,
    () => fetchUserWorlds(authUser!.id)
  )

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeModal])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeModal])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle successful post
  const handleSuccess = () => {
    closeModal()
    // PostFormでtriggerRefresh()が呼ばれるのでここでは不要
  }

  if (!isOpen || !authUser) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Centering container */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24">
        {/* Modal */}
        <div
          ref={modalRef}
          className="relative w-full max-w-xl animate-fade-in rounded-2xl bg-surface shadow-2xl ring-1 ring-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-bold text-foreground">新しい投稿</h2>
            <button
              onClick={closeModal}
              className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            ) : worlds.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover">
                  <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">ワールドに参加してください</p>
                <p className="mt-1 text-sm text-muted">投稿するには、まずワールドに参加する必要があります</p>
                <button
                  onClick={() => {
                    closeModal()
                    router.push('/worlds')
                  }}
                  className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-6 py-2 font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30"
                >
                  ワールドを探す
                </button>
              </div>
            ) : (
              <PostForm
                userId={authUser.id}
                worlds={worlds}
                defaultWorldId={defaultWorldId}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
