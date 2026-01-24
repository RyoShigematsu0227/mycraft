export default function PostLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface-hover" />
          <div className="h-6 w-12 animate-pulse rounded bg-surface-hover" />
        </div>
      </div>

      {/* Post Skeleton */}
      <div className="border-b border-border p-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-hover" />
          <div className="min-w-0 flex-1">
            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
            </div>
            {/* Content */}
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
            </div>
            {/* Actions */}
            <div className="mt-4 flex gap-8">
              <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section Skeleton */}
      <div className="border-b border-border p-4">
        <div className="h-5 w-24 animate-pulse rounded bg-surface-hover" />
      </div>

      {/* Comment Input Skeleton */}
      <div className="border-b border-border p-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-hover" />
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-surface-hover" />
        </div>
      </div>

      {/* Comments Skeleton */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border-b border-border p-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-hover" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
