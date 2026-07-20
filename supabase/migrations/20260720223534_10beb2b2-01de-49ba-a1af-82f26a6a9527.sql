DROP POLICY IF EXISTS "Public can read published lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read lesson files" ON storage.objects;

CREATE POLICY "Public can read published lesson files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'lessons'
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      WHERE l.published = true
        AND (l.video_path = storage.objects.name OR l.thumbnail_path = storage.objects.name)
    )
  );

CREATE POLICY "Admins can read lesson files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'lessons' AND public.has_role(auth.uid(), 'admin'));
