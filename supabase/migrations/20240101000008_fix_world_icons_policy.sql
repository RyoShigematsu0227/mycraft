-- Fix world-icons storage policy to allow uploads before world creation
-- Use user_id as folder prefix instead of world_id

DROP POLICY IF EXISTS "World owners can upload icons" ON storage.objects;
DROP POLICY IF EXISTS "World owners can update icons" ON storage.objects;
DROP POLICY IF EXISTS "World owners can delete icons" ON storage.objects;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload world icons"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'world-icons'
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Allow users to update their own icons
CREATE POLICY "Users can update world icons"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'world-icons'
    AND auth.uid()::text = split_part(name, '/', 1)
  )
  WITH CHECK (
    bucket_id = 'world-icons'
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Allow users to delete their own icons
CREATE POLICY "Users can delete world icons"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'world-icons'
    AND auth.uid()::text = split_part(name, '/', 1)
  );
