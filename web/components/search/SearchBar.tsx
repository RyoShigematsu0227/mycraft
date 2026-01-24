'use client'

import { useState, useEffect, useCallback } from 'react'

interface SearchBarProps {
  initialQuery?: string
  onSearch: (query: string) => void
  onTyping?: (isTyping: boolean) => void
  autoFocus?: boolean
}

export default function SearchBar({ initialQuery = '', onSearch, onTyping, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sync query with initialQuery from URL
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Debounce search
  useEffect(() => {
    if (query.trim()) {
      onTyping?.(true)
    }
    const timer = setTimeout(() => {
      onSearch(query)
      onTyping?.(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch, onTyping])

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isMobile ? '検索...' : 'ユーザー、ワールド、投稿を検索...'}
        autoFocus={autoFocus}
        className="w-full rounded-full border border-border bg-surface py-3 pl-12 pr-10 text-base placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
