'use client'

import { useState } from 'react'
import { Button, Textarea } from '@/components/ui'
import useComment from '@/hooks/useComment'

interface CommentFormProps {
  postId: string
  currentUserId?: string
  parentCommentId?: string
  placeholder?: string
  onSuccess?: () => void
  autoFocus?: boolean
}

export default function CommentForm({
  postId,
  currentUserId,
  parentCommentId,
  placeholder = 'コメントを入力...',
  onSuccess,
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const { createComment, loading, error } = useComment({ postId, currentUserId })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const result = await createComment(content, parentCommentId)
    if (result) {
      setContent('')
      onSuccess?.()
    }
  }

  if (!currentUserId) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        コメントするには
        <a href="/login" className="text-accent hover:underline">
          ログイン
        </a>
        してください
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            if (content.trim() && !loading) {
              handleSubmit(e)
            }
          }
        }}
        placeholder={placeholder}
        rows={2}
        maxLength={500}
        autoFocus={autoFocus}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? '送信中...' : '送信'}
        </Button>
      </div>
    </form>
  )
}
