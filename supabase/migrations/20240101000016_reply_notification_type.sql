-- Add 'reply' to the allowed notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'follow', 'repost', 'comment_like', 'reply'));

-- Update comment notification trigger to use 'reply' type for replies to comments
CREATE OR REPLACE FUNCTION on_comment_created()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id uuid;
  parent_comment_owner_id uuid;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;

  -- If this is a reply to another comment
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_owner_id FROM comments WHERE id = NEW.parent_comment_id;

    -- Notify parent comment owner (if not self) with 'reply' type
    IF parent_comment_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
      VALUES (parent_comment_owner_id, 'reply', NEW.user_id, NEW.post_id, NEW.id);
    END IF;
  ELSE
    -- Notify post owner (if not self) with 'comment' type
    IF post_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
      VALUES (post_owner_id, 'comment', NEW.user_id, NEW.post_id, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
