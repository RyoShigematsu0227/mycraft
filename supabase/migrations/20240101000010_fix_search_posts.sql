-- Fix search_posts to include world_icon_url and current user's like/repost status
DROP FUNCTION IF EXISTS search_posts(text, int);

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
  world_icon_url text,
  likes_count bigint,
  comments_count bigint,
  reposts_count bigint,
  is_liked boolean,
  is_reposted boolean,
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
    (SELECT EXISTS(SELECT 1 FROM likes WHERE likes.post_id = p.id AND likes.user_id = auth.uid())) as is_liked,
    (SELECT EXISTS(SELECT 1 FROM reposts WHERE reposts.post_id = p.id AND reposts.user_id = auth.uid())) as is_reposted,
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
