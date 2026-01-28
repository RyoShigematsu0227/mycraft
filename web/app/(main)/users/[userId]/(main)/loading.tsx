export default function UserProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header Skeleton */}
      <div className="relative overflow-hidden border-b border-border bg-surface">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-accent-secondary/20 to-accent/20 blur-3xl" />
        </div>

        <div className="relative px-4 py-6">
          {/* Top row with avatar and action button */}
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-accent/40 to-accent-secondary/40 blur-xl opacity-50" />
              <div className="relative h-24 w-24 animate-pulse rounded-full bg-surface-hover" />
            </div>
            <div className="pt-2">
              <div className="h-9 w-20 animate-pulse rounded-lg bg-surface-hover" />
            </div>
          </div>

          {/* User info */}
          <div className="mt-4 space-y-2">
            <div className="h-8 w-40 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
          </div>

          {/* Bio */}
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4">
            <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
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
