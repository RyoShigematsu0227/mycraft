'use client'

import { useState, useEffect, useCallback } from 'react'

interface SearchBarProps {
  initialQuery?: string
  onSearch: (query: string) => void
  autoFocus?: boolean
}

export default function SearchBar({ initialQuery = '', onSearch, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)

  // Sync query with initialQuery from URL
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

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
        placeholder="ユーザー、ワールド、投稿を検索..."
        autoFocus={autoFocus}
        className="w-full rounded-full border border-gray-300 bg-white py-3 pl-12 pr-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:placeholder-gray-400"
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
