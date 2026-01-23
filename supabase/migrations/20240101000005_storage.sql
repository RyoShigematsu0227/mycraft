-- =============================================
-- Create storage buckets
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('world-icons', 'world-icons', true),
  ('post-images', 'post-images', true);

-- =============================================
-- Storage policies for avatars bucket
-- =============================================

-- Anyone can view avatars
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Storage policies for world-icons bucket
-- =============================================

-- Anyone can view world icons
CREATE POLICY "World icons are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'world-icons');

-- World owners can upload icons
CREATE POLICY "World owners can upload icons"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'world-icons'
    AND EXISTS (
      SELECT 1 FROM worlds
      WHERE id::text = (storage.foldername(name))[1]
      AND owner_id = auth.uid()
    )
  );

-- World owners can update icons
CREATE POLICY "World owners can update icons"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'world-icons'
    AND EXISTS (
      SELECT 1 FROM worlds
      WHERE id::text = (storage.foldername(name))[1]
      AND owner_id = auth.uid()
    )
  );

-- World owners can delete icons
CREATE POLICY "World owners can delete icons"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'world-icons'
    AND EXISTS (
      SELECT 1 FROM worlds
      WHERE id::text = (storage.foldername(name))[1]
      AND owner_id = auth.uid()
    )
  );

-- =============================================
-- Storage policies for post-images bucket
-- =============================================

-- Anyone can view post images
CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Users can upload images to their own folder
CREATE POLICY "Users can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own post images
CREATE POLICY "Users can update their own post images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own post images
CREATE POLICY "Users can delete their own post images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
