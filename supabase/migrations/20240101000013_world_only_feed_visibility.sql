-- =============================================
-- Update feed functions for world_only visibility
-- world_only posts are visible only to world members,
-- but appear in home feeds for members
-- =============================================

-- =============================================
-- Get feed latest with world_only support
-- =============================================
DROP FUNCTION IF EXISTS get_feed_latest(int, timestamptz);
DROP FUNCTION IF EXISTS get_feed_latest(uuid, int, timestamptz);

CREATE OR REPLACE FUNCTION get_feed_latest(
  p_viewer_id uuid DEFAULT NULL,
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
  images json,
  is_repost boolean,
  reposted_by_user_id varchar(30),
  reposted_by_display_name varchar(50),
  repost_created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH viewer_worlds AS (
    SELECT wm.world_id AS vw_world_id FROM world_members wm WHERE wm.user_id = p_viewer_id
  ),
  feed_items AS (
    -- Original posts (public or world_only if viewer is member)
    SELECT
      p.id,
      p.user_id,
      p.world_id,
      p.content,
      p.visibility,
      p.created_at,
      p.created_at as sort_time,
      false as is_repost,
      NULL::varchar(30) as reposted_by_user_id,
      NULL::varchar(50) as reposted_by_display_name,
      NULL::timestamptz as repost_created_at
    FROM posts p
    WHERE (
      p.visibility = 'public'
      OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
    )

    UNION ALL

    -- Reposts (only of public posts, or world_only if viewer is member)
    SELECT
      p.id,
      p.user_id,
      p.world_id,
      p.content,
      p.visibility,
      p.created_at,
      r.created_at as sort_time,
      true as is_repost,
      ru.user_id as reposted_by_user_id,
      ru.display_name as reposted_by_display_name,
      r.created_at as repost_created_at
    FROM reposts r
    JOIN posts p ON r.post_id = p.id
    JOIN users ru ON r.user_id = ru.id
    WHERE (
      p.visibility = 'public'
      OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
    )
  )
  SELECT
    fi.id,
    fi.user_id,
    fi.world_id,
    fi.content,
    fi.visibility,
    fi.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = fi.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = fi.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = fi.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = fi.id
    ) as images,
    fi.is_repost,
    fi.reposted_by_user_id,
    fi.reposted_by_display_name,
    fi.repost_created_at
  FROM feed_items fi
  JOIN users u ON fi.user_id = u.id
  LEFT JOIN worlds w ON fi.world_id = w.id
  WHERE (p_cursor IS NULL OR fi.sort_time < p_cursor)
  ORDER BY fi.sort_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed following with world_only support
-- =============================================
DROP FUNCTION IF EXISTS get_feed_following(uuid, int, timestamptz);

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
  images json,
  is_repost boolean,
  reposted_by_user_id varchar(30),
  reposted_by_display_name varchar(50),
  repost_created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH following_ids AS (
    SELECT following_id FROM follows WHERE follower_id = p_user_id
    UNION
    SELECT p_user_id
  ),
  viewer_worlds AS (
    SELECT wm.world_id AS vw_world_id FROM world_members wm WHERE wm.user_id = p_user_id
  ),
  feed_items AS (
    -- Original posts from followed users and self
    SELECT
      p.id,
      p.user_id,
      p.world_id,
      p.content,
      p.visibility,
      p.created_at,
      p.created_at as sort_time,
      false as is_repost,
      NULL::varchar(30) as reposted_by_user_id,
      NULL::varchar(50) as reposted_by_display_name,
      NULL::timestamptz as repost_created_at
    FROM posts p
    WHERE p.user_id IN (SELECT following_id FROM following_ids)
      AND (
        p.visibility = 'public'
        OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
      )

    UNION ALL

    -- Reposts by followed users and self
    SELECT
      p.id,
      p.user_id,
      p.world_id,
      p.content,
      p.visibility,
      p.created_at,
      r.created_at as sort_time,
      true as is_repost,
      ru.user_id as reposted_by_user_id,
      ru.display_name as reposted_by_display_name,
      r.created_at as repost_created_at
    FROM reposts r
    JOIN posts p ON r.post_id = p.id
    JOIN users ru ON r.user_id = ru.id
    WHERE r.user_id IN (SELECT following_id FROM following_ids)
      AND (
        p.visibility = 'public'
        OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
      )
  )
  SELECT
    fi.id,
    fi.user_id,
    fi.world_id,
    fi.content,
    fi.visibility,
    fi.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = fi.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = fi.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = fi.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = fi.id
    ) as images,
    fi.is_repost,
    fi.reposted_by_user_id,
    fi.reposted_by_display_name,
    fi.repost_created_at
  FROM feed_items fi
  JOIN users u ON fi.user_id = u.id
  LEFT JOIN worlds w ON fi.world_id = w.id
  WHERE (p_cursor IS NULL OR fi.sort_time < p_cursor)
  ORDER BY fi.sort_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed world with membership check
-- =============================================
DROP FUNCTION IF EXISTS get_feed_world(uuid, int, timestamptz);

CREATE OR REPLACE FUNCTION get_feed_world(
  p_world_id uuid,
  p_viewer_id uuid DEFAULT NULL,
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
DECLARE
  v_is_member boolean;
BEGIN
  -- Check if viewer is a member
  SELECT EXISTS(
    SELECT 1 FROM world_members wm
    WHERE wm.world_id = p_world_id AND wm.user_id = p_viewer_id
  ) INTO v_is_member;

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
    AND (
      p.visibility = 'public'
      OR (p.visibility = 'world_only' AND v_is_member)
    )
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed user with viewer membership check
-- =============================================
DROP FUNCTION IF EXISTS get_feed_user(uuid, int, timestamptz);

CREATE OR REPLACE FUNCTION get_feed_user(
  p_user_id uuid,
  p_viewer_id uuid DEFAULT NULL,
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
  images json,
  is_repost boolean,
  reposted_by_user_id varchar(30),
  reposted_by_display_name varchar(50),
  repost_created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH viewer_worlds AS (
    SELECT wm.world_id AS vw_world_id FROM world_members wm WHERE wm.user_id = p_viewer_id
  ),
  feed_items AS (
    -- Original posts by the user
    SELECT
      p.id,
      p.user_id,
      p.world_id,
      p.content,
      p.visibility,
      p.created_at,
      p.created_at as sort_time,
      false as is_repost,
      NULL::varchar(30) as reposted_by_user_id,
      NULL::varchar(50) as reposted_by_display_name,
      NULL::timestamptz as repost_created_at
    FROM posts p
    WHERE p.user_id = p_user_id
      AND (
        p.visibility = 'public'
        OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
      )

    UNION ALL

    -- Reposts by the user
    SELECT
      p.id,
      p.user_id,
      p.world_id,
      p.content,
      p.visibility,
      p.created_at,
      r.created_at as sort_time,
      true as is_repost,
      ru.user_id as reposted_by_user_id,
      ru.display_name as reposted_by_display_name,
      r.created_at as repost_created_at
    FROM reposts r
    JOIN posts p ON r.post_id = p.id
    JOIN users ru ON r.user_id = ru.id
    WHERE r.user_id = p_user_id
      AND (
        p.visibility = 'public'
        OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
      )
  )
  SELECT
    fi.id,
    fi.user_id,
    fi.world_id,
    fi.content,
    fi.visibility,
    fi.created_at,
    u.display_name as user_display_name,
    u.user_id as user_user_id,
    u.avatar_url as user_avatar_url,
    w.name as world_name,
    w.icon_url as world_icon_url,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = fi.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = fi.id) as comments_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = fi.id) as reposts_count,
    (
      SELECT COALESCE(json_agg(
        json_build_object('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        ORDER BY pi.display_order
      ), '[]'::json)
      FROM post_images pi WHERE pi.post_id = fi.id
    ) as images,
    fi.is_repost,
    fi.reposted_by_user_id,
    fi.reposted_by_display_name,
    fi.repost_created_at
  FROM feed_items fi
  JOIN users u ON fi.user_id = u.id
  LEFT JOIN worlds w ON fi.world_id = w.id
  WHERE (p_cursor IS NULL OR fi.sort_time < p_cursor)
  ORDER BY fi.sort_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Get feed recommended with world_only support
-- =============================================
DROP FUNCTION IF EXISTS get_feed_recommended(int, int);

CREATE OR REPLACE FUNCTION get_feed_recommended(
  p_viewer_id uuid DEFAULT NULL,
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
  images json
) AS $$
BEGIN
  RETURN QUERY
  WITH viewer_worlds AS (
    SELECT wm.world_id AS vw_world_id FROM world_members wm WHERE wm.user_id = p_viewer_id
  )
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
  WHERE (
    p.visibility = 'public'
    OR (p.visibility = 'world_only' AND p.world_id IN (SELECT vw_world_id FROM viewer_worlds))
  )
  ORDER BY (
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) +
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) * 2 +
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = p.id) * 3
  ) DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
