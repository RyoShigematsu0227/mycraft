import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 dark:bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          ページが見つかりません
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            ホームに戻る
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition hover:bg-surface dark:border-border dark:bg-surface dark:text-foreground dark:hover:bg-surface-hover"
          >
            検索する
          </Link>
        </div>
      </div>
    </div>
  )
}
