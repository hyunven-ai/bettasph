-- ============================================================
-- IKANPEDIA.ID — Tier 2: Realtime + Storage Migration
-- Run AFTER supabase_migration_auctions.sql berhasil
-- ============================================================

-- STEP 1: Enable Realtime pada tabel bids dan auctions
-- Supabase Realtime menggunakan PostgreSQL logical replication
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;

-- STEP 2: Buat Storage bucket untuk foto lelang
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'auction-images',
  'auction-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880;

-- STEP 3: Storage Policies
DROP POLICY IF EXISTS "Public read auction images"          ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload auction images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete auction images" ON storage.objects;

-- Siapapun bisa lihat foto
CREATE POLICY "Public read auction images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'auction-images');

-- Upload diizinkan (validasi di API layer)
CREATE POLICY "Authenticated upload auction images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'auction-images');

-- Delete diizinkan (validasi di API layer)
CREATE POLICY "Authenticated delete auction images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'auction-images');
