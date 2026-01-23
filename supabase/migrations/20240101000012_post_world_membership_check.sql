-- Add database-level check to ensure posts can only be created in worlds the user is a member of
-- Reposts remain unrestricted (they don't have a world_id, they just reference the original post)

-- Create a function to check if user can post to a world
CREATE OR REPLACE FUNCTION check_post_world_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is a member of the world they're posting to
  IF NOT EXISTS (
    SELECT 1 FROM world_members
    WHERE world_id = NEW.world_id
    AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'You must be a member of the world to create a post';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on posts table for INSERT only
DROP TRIGGER IF EXISTS enforce_post_world_membership ON posts;
CREATE TRIGGER enforce_post_world_membership
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION check_post_world_membership();

-- Note: Reposts are stored in the 'reposts' table and only reference post_id and user_id
-- There's no world_id restriction on reposts, which is the desired behavior
