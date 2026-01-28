export default function WorldDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-surface px-4 py-6">
        <div className="flex items-start gap-4">
          {/* World Icon */}
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-surface-hover" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                {/* World Name */}
                <div className="h-7 w-40 animate-pulse rounded bg-surface-hover" />
                {/* Owner */}
                <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
              </div>
              {/* Button */}
              <div className="h-9 w-20 shrink-0 animate-pulse rounded-lg bg-surface-hover" />
            </div>
            {/* Description */}
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
            </div>
            {/* Stats */}
            <div className="mt-4 flex gap-4">
              <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Skeleton */}
      <div className="divide-y divide-border">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-hover" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                  <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
