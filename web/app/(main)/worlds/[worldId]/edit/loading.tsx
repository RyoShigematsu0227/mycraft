export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="h-8 w-48 animate-pulse rounded bg-surface-hover mb-6" />
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-surface-hover" />
          <div className="h-24 w-full animate-pulse rounded bg-surface-hover" />
          <div className="h-10 w-32 animate-pulse rounded bg-surface-hover" />
        </div>
      </div>
    </div>
  )
}
