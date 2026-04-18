-- Migration: Tambah kolom media array ke tabel fish_catalog
-- Jalankan ini di Supabase SQL Editor

ALTER TABLE fish_catalog
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- Isi media_urls dengan image_url existing sebagai item pertama (opsional)
UPDATE fish_catalog 
SET media_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (media_urls IS NULL OR media_urls = '{}');
