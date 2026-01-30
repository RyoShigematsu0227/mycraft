import { PostCardSkeleton } from '@/components/ui'

export default function PostDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-full bg-surface-hover" />
          <div className="h-6 w-12 animate-pulse rounded bg-surface-hover" />
        </div>
      </div>

      {/* Post Skeleton */}
      <PostCardSkeleton />

      {/* Comment Section Skeleton */}
      <div className="border-t border-border">
        {/* Comment input skeleton */}
        <div className="flex gap-3 p-4 border-b border-border">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-hover" />
          <div className="flex-1 h-10 animate-pulse rounded-lg bg-surface-hover" />
        </div>

        {/* Comments skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 p-4 border-b border-border">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-12 animate-pulse rounded bg-surface-hover" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
