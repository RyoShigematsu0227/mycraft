import { Layout } from '@/components/layout'
import { EmptyState, Button } from '@/components/ui'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
      <div className="px-4 py-6">
        <EmptyState
          icon={
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          }
          title="MyCraftへようこそ"
          description="Minecraftワールドの住人になりきって、スクリーンショットや建築を共有しよう"
          action={
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">ログイン</Button>
              </Link>
              <Link href="/signup">
                <Button>新規登録</Button>
              </Link>
            </div>
          }
        />
      </div>
    </Layout>
  )
}
