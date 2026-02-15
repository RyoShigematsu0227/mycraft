'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useWorldModalStore } from '@/lib/stores'
import { useAuth } from '@/hooks/useAuth'
import WorldForm from './WorldForm'

export default function WorldModal() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const { isOpen, closeModal } = useWorldModalStore()
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Handle successful world creation
  const handleSuccess = (worldId: string) => {
    closeModal()
    router.push(`/worlds/${worldId}`)
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
            <h2 className="text-lg font-bold text-foreground">新しいワールド</h2>
            <button
              onClick={closeModal}
              className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <WorldForm userId={authUser.id} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  )
}
