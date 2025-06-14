
-- Create video-media storage bucket and RLS policies
-- This migration sets up the complete storage infrastructure

-- Create the video-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-media',
  'video-media',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files to video-media bucket
CREATE POLICY "Allow authenticated uploads to video-media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'video-media' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow public read access to video-media files
CREATE POLICY "Allow public read access to video-media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'video-media'
);

-- Policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files in video-media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'video-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own files
CREATE POLICY "Allow users to update own files in video-media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'video-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
