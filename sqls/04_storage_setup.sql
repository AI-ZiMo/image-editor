-- =====================================================
-- Supabase 存储桶设置 (Storage Setup)
-- =====================================================

-- 创建图片存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 设置存储桶的 RLS 策略
-- 允许已认证用户上传图片到自己的文件夹
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 允许任何人查看图片（因为存储桶是公开的）
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'images');

-- 允许已认证用户删除自己上传的图片
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 允许已认证用户更新自己的图片元数据
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  ); 