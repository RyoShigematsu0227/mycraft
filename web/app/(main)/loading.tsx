import { PostCardSkeleton } from '@/components/ui'

export default function MainLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-20 animate-pulse rounded-lg bg-surface dark:bg-surface" />
          ))}
        </div>
      </div>

      {/* Feed skeleton */}
      {[1, 2, 3].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
