-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Users policies
-- =============================================
-- Anyone can view users
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- Worlds policies
-- =============================================
-- Anyone can view worlds
CREATE POLICY "Worlds are viewable by everyone"
  ON worlds FOR SELECT
  USING (true);

-- Authenticated users can create worlds
CREATE POLICY "Authenticated users can create worlds"
  ON worlds FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their worlds
CREATE POLICY "Owners can update their worlds"
  ON worlds FOR UPDATE
  USING (auth.uid() = owner_id);

-- Owners can delete their worlds
CREATE POLICY "Owners can delete their worlds"
  ON worlds FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- World members policies
-- =============================================
-- Anyone can view world members
CREATE POLICY "World members are viewable by everyone"
  ON world_members FOR SELECT
  USING (true);

-- Authenticated users can join worlds
CREATE POLICY "Users can join worlds"
  ON world_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can leave worlds
CREATE POLICY "Users can leave worlds"
  ON world_members FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Posts policies
-- =============================================
-- Helper function to check if user is world member
CREATE OR REPLACE FUNCTION is_world_member(p_world_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM world_members
    WHERE world_id = p_world_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View posts: public or world_only if member
CREATE POLICY "Posts are viewable based on visibility"
  ON posts FOR SELECT
  USING (
    visibility = 'public'
    OR (visibility = 'world_only' AND is_world_member(world_id, auth.uid()))
    OR user_id = auth.uid()
  );

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Post images policies
-- =============================================
-- View images if can view parent post
CREATE POLICY "Post images follow post visibility"
  ON post_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
      AND (
        posts.visibility = 'public'
        OR (posts.visibility = 'world_only' AND is_world_member(posts.world_id, auth.uid()))
        OR posts.user_id = auth.uid()
      )
    )
  );

-- Authenticated users can insert images for their posts
CREATE POLICY "Users can add images to their posts"
  ON post_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Users can delete images from their posts
CREATE POLICY "Users can delete images from their posts"
  ON post_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- =============================================
-- Likes policies
-- =============================================
-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

-- Authenticated users can like posts
CREATE POLICY "Authenticated users can like posts"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their likes
CREATE POLICY "Users can remove their likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Comments policies
-- =============================================
-- View comments if can view parent post
CREATE POLICY "Comments follow post visibility"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND (
        posts.visibility = 'public'
        OR (posts.visibility = 'world_only' AND is_world_member(posts.world_id, auth.uid()))
        OR posts.user_id = auth.uid()
      )
    )
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Comment likes policies
-- =============================================
-- Anyone can view comment likes
CREATE POLICY "Comment likes are viewable by everyone"
  ON comment_likes FOR SELECT
  USING (true);

-- Authenticated users can like comments
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their comment likes
CREATE POLICY "Users can remove their comment likes"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Reposts policies
-- =============================================
-- Anyone can view reposts
CREATE POLICY "Reposts are viewable by everyone"
  ON reposts FOR SELECT
  USING (true);

-- Authenticated users can repost
CREATE POLICY "Authenticated users can repost"
  ON reposts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their reposts
CREATE POLICY "Users can remove their reposts"
  ON reposts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Follows policies
-- =============================================
-- Anyone can view follows
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

-- Authenticated users can follow others
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================
-- Notifications policies
-- =============================================
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System inserts notifications (via triggers with SECURITY DEFINER)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
