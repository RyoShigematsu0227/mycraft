-- =============================================
-- Get feed latest
-- =============================================
CREATE OR REPLACE FUNCTION get_feed_latest(
  p_limit int DEFAULT 20,
  p_cursor timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  world_id uuid,
  content text,
  visibility varchar(20),
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  world_name varchar(100),
  world_icon_url text,
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  images json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.world_id,
    p.content,
    p.visibility,
    p.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = p.id
    ) as images
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN worlds w ON p.world_id = w.id
  WHERE p.visibility = 'public'
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed recommended (MVP: based on engagement)
-- =============================================
CREATE OR REPLACE FUNCTION get_feed_recommended(
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  world_id uuid,
  content text,
  visibility varchar(20),
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  world_name varchar(100),
  world_icon_url text,
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  images json,
  score bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.world_id,
    p.content,
    p.visibility,
    p.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = p.id
    ) as images,
    (
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) * 1 +
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) * 2 +
      (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) * 3
    ) as score
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN worlds w ON p.world_id = w.id
  WHERE p.visibility = 'public'
    AND p.created_at > now() - interval '7 days'
  ORDER BY score DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed following
-- =============================================
CREATE OR REPLACE FUNCTION get_feed_following(
  p_user_id uuid,
  p_limit int DEFAULT 20,
  p_cursor timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  world_id uuid,
  content text,
  visibility varchar(20),
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  world_name varchar(100),
  world_icon_url text,
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  images json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.world_id,
    p.content,
    p.visibility,
    p.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = p.id
    ) as images
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN worlds w ON p.world_id = w.id
  WHERE p.user_id IN (
    SELECT following_id FROM follows WHERE follower_id = p_user_id
  )
    AND p.visibility = 'public'
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed world
-- =============================================
CREATE OR REPLACE FUNCTION get_feed_world(
  p_world_id uuid,
  p_limit int DEFAULT 20,
  p_cursor timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  world_id uuid,
  content text,
  visibility varchar(20),
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  images json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.world_id,
    p.content,
    p.visibility,
    p.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = p.id
    ) as images
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE p.world_id = p_world_id
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get post with details
-- =============================================
CREATE OR REPLACE FUNCTION get_post_with_details(p_post_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  world_id uuid,
  content text,
  visibility varchar(20),
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  world_name varchar(100),
  world_icon_url text,
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  images json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.world_id,
    p.content,
    p.visibility,
    p.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = p.id
    ) as images
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN worlds w ON p.world_id = w.id
  WHERE p.id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get comments tree
-- =============================================
CREATE OR REPLACE FUNCTION get_comments_tree(p_post_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  post_id uuid,
  parent_comment_id uuid,
  content text,
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  likes_count bigint,
  depth int
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments
    SELECT
      c.id,
      c.user_id,
      c.post_id,
      c.parent_comment_id,
      c.content,
      c.created_at,
      0 as depth
    FROM comments c
    WHERE c.post_id = p_post_id AND c.parent_comment_id IS NULL

    UNION ALL

    -- Recursive case: replies
    SELECT
      c.id,
      c.user_id,
      c.post_id,
      c.parent_comment_id,
      c.content,
      c.created_at,
      ct.depth + 1
    FROM comments c
    JOIN comment_tree ct ON c.parent_comment_id = ct.id
  )
  SELECT
    ct.id,
    ct.user_id,
    ct.post_id,
    ct.parent_comment_id,
    ct.content,
    ct.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    (SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = ct.id) as likes_count,
    ct.depth
  FROM comment_tree ct
  JOIN users u ON ct.user_id = u.id
  ORDER BY ct.depth, ct.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Search users
-- =============================================
CREATE OR REPLACE FUNCTION search_users(
  p_query text,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  user_id varchar(30),
  display_name varchar(50),
  avatar_url text,
  bio text,
  followers_count bigint,
  following_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.user_id,
    u.display_name,
    u.avatar_url,
    u.bio,
    (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count
  FROM users u
  WHERE u.user_id ILIKE '%' || p_query || '%'
     OR u.display_name ILIKE '%' || p_query || '%'
  ORDER BY
    CASE
      WHEN u.user_id ILIKE p_query THEN 0
      WHEN u.display_name ILIKE p_query THEN 1
      WHEN u.user_id ILIKE p_query || '%' THEN 2
      WHEN u.display_name ILIKE p_query || '%' THEN 3
      ELSE 4
    END,
    (SELECT COUNT(*) FROM follows WHERE following_id = u.id) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Search worlds
-- =============================================
CREATE OR REPLACE FUNCTION search_worlds(
  p_query text,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name varchar(100),
  description text,
  icon_url text,
  owner_id uuid,
  owner_display_name varchar(50),
  owner_user_id varchar(30),
  members_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    w.description,
    w.icon_url,
    w.owner_id,
    u.display_name as owner_display_name,
    u.user_id as owner_user_id,
    (SELECT COUNT(*) FROM world_members WHERE world_id = w.id) as members_count
  FROM worlds w
  JOIN users u ON w.owner_id = u.id
  WHERE w.name ILIKE '%' || p_query || '%'
     OR w.description ILIKE '%' || p_query || '%'
  ORDER BY
    CASE
      WHEN w.name ILIKE p_query THEN 0
      WHEN w.name ILIKE p_query || '%' THEN 1
      ELSE 2
    END,
    (SELECT COUNT(*) FROM world_members WHERE world_id = w.id) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Search posts
-- =============================================
CREATE OR REPLACE FUNCTION search_posts(
  p_query text,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  world_id uuid,
  content text,
  visibility varchar(20),
  created_at timestamptz,
  user_display_name varchar(50),
  user_user_id varchar(30),
  user_avatar_url text,
  world_name varchar(100),
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  images json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.world_id,
    p.content,
    p.visibility,
    p.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = p.id
    ) as images
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN worlds w ON p.world_id = w.id
  WHERE p.visibility = 'public'
    AND p.content ILIKE '%' || p_query || '%'
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get user stats
-- =============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE (
  posts_count bigint,
  followers_count bigint,
  following_count bigint,
  worlds_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM posts WHERE posts.user_id = p_user_id) as posts_count,
    (SELECT COUNT(*) FROM follows WHERE following_id = p_user_id) as followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = p_user_id) as following_count,
    (SELECT COUNT(*) FROM world_members WHERE world_members.user_id = p_user_id) as worlds_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
