-- ワールド削除時に関連する投稿も削除されるように変更
-- 現在: ON DELETE SET NULL → 変更後: ON DELETE CASCADE

-- 既存の外部キー制約を削除
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_world_id_fkey;

-- 新しい外部キー制約を追加（CASCADE）
ALTER TABLE posts
  ADD CONSTRAINT posts_world_id_fkey
  FOREIGN KEY (world_id) REFERENCES worlds(id) ON DELETE CASCADE;
