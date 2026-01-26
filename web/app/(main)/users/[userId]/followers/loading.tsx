export default function FollowersLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-full bg-surface-hover" />
          <div className="space-y-1">
            <div className="h-5 w-24 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-surface-hover" />
              <div className="h-3 w-16 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
