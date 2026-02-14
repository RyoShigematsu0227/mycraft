import { describe, it, expect, beforeEach } from 'vitest'
import { usePostStatsStore } from '../postStats'

// Reset store before each test
beforeEach(() => {
  usePostStatsStore.setState({ stats: {} })
})

describe('postStats store', () => {
  describe('initPost', () => {
    it('新規投稿を初期化する', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { likeCount: 5, isLiked: true })

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.likeCount).toBe(5)
      expect(stats.isLiked).toBe(true)
      // デフォルト値が適用される
      expect(stats.repostCount).toBe(0)
      expect(stats.isReposted).toBe(false)
      expect(stats.commentCount).toBe(0)
    })

    it('既存投稿に部分マージする', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { likeCount: 5, isLiked: true })
      initPost('post-1', { repostCount: 3 })

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.likeCount).toBe(5)
      expect(stats.isLiked).toBe(true)
      expect(stats.repostCount).toBe(3)
    })
  })

  describe('toggleLike', () => {
    it('未いいね → いいね（count+1, isLiked: true, likeDirty: true）', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { likeCount: 3, isLiked: false })

      const { wasLiked, prevCount } = usePostStatsStore.getState().toggleLike('post-1')

      expect(wasLiked).toBe(false)
      expect(prevCount).toBe(3)

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.isLiked).toBe(true)
      expect(stats.likeCount).toBe(4)
      expect(stats.likeDirty).toBe(true)
    })

    it('いいね済み → 解除（count-1, isLiked: false）', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { likeCount: 3, isLiked: true })

      const { wasLiked, prevCount } = usePostStatsStore.getState().toggleLike('post-1')

      expect(wasLiked).toBe(true)
      expect(prevCount).toBe(3)

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.isLiked).toBe(false)
      expect(stats.likeCount).toBe(2)
    })

    it('count 0の時に解除しても負にならない', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { likeCount: 0, isLiked: true })

      usePostStatsStore.getState().toggleLike('post-1')

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.likeCount).toBe(0)
    })

    it('未初期化の投稿にトグルするとデフォルト値を使う', () => {
      const { wasLiked, prevCount } = usePostStatsStore.getState().toggleLike('unknown-post')

      expect(wasLiked).toBe(false)
      expect(prevCount).toBe(0)

      const stats = usePostStatsStore.getState().stats['unknown-post']
      expect(stats.isLiked).toBe(true)
      expect(stats.likeCount).toBe(1)
    })
  })

  describe('rollbackLike', () => {
    it('トグル後にロールバックで元の状態に戻る', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { likeCount: 3, isLiked: false })

      const { wasLiked, prevCount } = usePostStatsStore.getState().toggleLike('post-1')

      // ロールバック
      usePostStatsStore.getState().rollbackLike('post-1', wasLiked, prevCount)

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.isLiked).toBe(false)
      expect(stats.likeCount).toBe(3)
    })
  })

  describe('toggleRepost', () => {
    it('未リポスト → リポスト（count+1, isReposted: true, repostDirty: true）', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { repostCount: 2, isReposted: false })

      const { wasReposted, prevCount } = usePostStatsStore.getState().toggleRepost('post-1')

      expect(wasReposted).toBe(false)
      expect(prevCount).toBe(2)

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.isReposted).toBe(true)
      expect(stats.repostCount).toBe(3)
      expect(stats.repostDirty).toBe(true)
    })

    it('リポスト済み → 解除（count-1, isReposted: false）', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { repostCount: 2, isReposted: true })

      const { wasReposted, prevCount } = usePostStatsStore.getState().toggleRepost('post-1')

      expect(wasReposted).toBe(true)
      expect(prevCount).toBe(2)

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.isReposted).toBe(false)
      expect(stats.repostCount).toBe(1)
    })

    it('count 0の時に解除しても負にならない', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { repostCount: 0, isReposted: true })

      usePostStatsStore.getState().toggleRepost('post-1')

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.repostCount).toBe(0)
    })
  })

  describe('rollbackRepost', () => {
    it('トグル後にロールバックで元の状態に戻る', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { repostCount: 2, isReposted: false })

      const { wasReposted, prevCount } = usePostStatsStore.getState().toggleRepost('post-1')

      usePostStatsStore.getState().rollbackRepost('post-1', wasReposted, prevCount)

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.isReposted).toBe(false)
      expect(stats.repostCount).toBe(2)
    })
  })

  describe('commentCount', () => {
    it('incrementCommentCount で +1、commentDirty が true', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { commentCount: 5 })

      usePostStatsStore.getState().incrementCommentCount('post-1')

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.commentCount).toBe(6)
      expect(stats.commentDirty).toBe(true)
    })

    it('decrementCommentCount で -1', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { commentCount: 5 })

      usePostStatsStore.getState().decrementCommentCount('post-1')

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.commentCount).toBe(4)
      expect(stats.commentDirty).toBe(true)
    })

    it('decrementCommentCount で 0 未満にならない', () => {
      const { initPost } = usePostStatsStore.getState()
      initPost('post-1', { commentCount: 0 })

      usePostStatsStore.getState().decrementCommentCount('post-1')

      const stats = usePostStatsStore.getState().stats['post-1']
      expect(stats.commentCount).toBe(0)
    })
  })
})
