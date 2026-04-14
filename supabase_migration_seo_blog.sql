-- ============================================================
-- SQL Migration: Tambahkan Kolom SEO ke tabel blog_posts
-- Jalankan di Supabase Dashboard -> SQL Editor
-- ============================================================

-- Tambahkan kolom meta_title, meta_description, focus_keyword, dqn tags
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS focus_keyword text,
ADD COLUMN IF NOT EXISTS tags text[];

-- Optional: Set default values jika diperlukan, saat ini dibiarkan NULL.
