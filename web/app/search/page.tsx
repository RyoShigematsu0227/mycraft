'use client'

import { useState, useCallback } from 'react'
import { Layout } from '@/components/layout'
import { SearchBar, SearchResults } from '@/components/search'
import { BackButton } from '@/components/ui'
import useSearch from '@/hooks/useSearch'
import { useAuth } from '@/hooks/useAuth'

export default function SearchPage() {
  const { user } = useAuth()
  const { users, worlds, posts, loading, search } = useSearch()
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      setHasSearched(true)
    }
    search(query)
  }, [search])

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="sticky top-14 z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} autoFocus />
            </div>
          </div>
        </div>

        {/* Results */}
        <SearchResults
          users={users}
          worlds={worlds}
          posts={posts}
          loading={loading}
          hasSearched={hasSearched}
          currentUserId={user?.id}
        />
      </div>
    </Layout>
  )
}
