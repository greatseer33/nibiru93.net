-- Add storage policies for novel-covers bucket
CREATE POLICY "Users can view novel covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'novel-covers');

CREATE POLICY "Authors can upload novel covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'novel-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authors can update their novel covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'novel-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authors can delete their novel covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'novel-covers' AND auth.uid()::text = (storage.foldername(name))[1]);