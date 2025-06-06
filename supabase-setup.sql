-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Set up RLS policies for the images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Allow anyone to view images (since bucket is public)
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'images');

-- Allow authenticated users to delete their own uploaded images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]); 