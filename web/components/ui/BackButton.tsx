'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`rounded-full p-2 hover:bg-surface dark:hover:bg-surface ${className}`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
