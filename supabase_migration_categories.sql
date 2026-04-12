-- ============================================================
-- SQL Migration: Buat tabel categories di Supabase
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Buat tabel categories
CREATE TABLE IF NOT EXISTS public.categories (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name      text NOT NULL UNIQUE,
  slug      text NOT NULL UNIQUE,
  color     text DEFAULT '#818cf8',
  created_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Policy: siapapun bisa READ (untuk frontend filter)
CREATE POLICY "Public can read categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- 4. Policy: service_role bypass RLS (untuk admin API)
-- Sudah otomatis dengan supabaseAdmin (service_role key)

-- 5. Seed data awal (opsional — sesuaikan dengan kategori yang sudah ada di fish_catalog)
INSERT INTO public.categories (name, slug, color) VALUES
  ('Cupang Elite',   'cupang-elite',   '#818cf8'),
  ('Koi Show Grade', 'koi-show-grade', '#34d399'),
  ('Arwana Exotic',  'arwana-exotic',  '#f59e0b')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Verifikasi:
-- SELECT * FROM categories;
-- ============================================================
