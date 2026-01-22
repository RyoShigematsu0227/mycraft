-- =============================================
-- Notification trigger function
-- =============================================

-- Function to create notification on like
CREATE OR REPLACE FUNCTION on_like_created()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id uuid;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;

  -- Don't notify if user liked their own post
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, actor_id, post_id)
    VALUES (post_owner_id, 'like', NEW.user_id, NEW.post_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION on_like_created();

-- Function to create notification on comment
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

    -- Notify parent comment owner (if not self)
    IF parent_comment_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
      VALUES (parent_comment_owner_id, 'comment', NEW.user_id, NEW.post_id, NEW.id);
    END IF;
  ELSE
    -- Notify post owner (if not self)
    IF post_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
      VALUES (post_owner_id, 'comment', NEW.user_id, NEW.post_id, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION on_comment_created();

-- Function to create notification on follow
CREATE OR REPLACE FUNCTION on_follow_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, actor_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_on_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION on_follow_created();

-- Function to create notification on repost
CREATE OR REPLACE FUNCTION on_repost_created()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id uuid;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;

  -- Don't notify if user reposted their own post
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, actor_id, post_id)
    VALUES (post_owner_id, 'repost', NEW.user_id, NEW.post_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_on_repost_created
  AFTER INSERT ON reposts
  FOR EACH ROW
  EXECUTE FUNCTION on_repost_created();

-- Function to create notification on comment like
CREATE OR REPLACE FUNCTION on_comment_like_created()
RETURNS TRIGGER AS $$
DECLARE
  comment_owner_id uuid;
  post_id_val uuid;
BEGIN
  -- Get comment owner and post_id
  SELECT user_id, post_id INTO comment_owner_id, post_id_val
  FROM comments WHERE id = NEW.comment_id;

  -- Don't notify if user liked their own comment
  IF comment_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
    VALUES (comment_owner_id, 'comment_like', NEW.user_id, post_id_val, NEW.comment_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_on_comment_like_created
  AFTER INSERT ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION on_comment_like_created();
