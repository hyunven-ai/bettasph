-- Migration: Tambah kolom diskon ke tabel fish_catalog
-- Jalankan ini di Supabase SQL Editor

ALTER TABLE fish_catalog
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100);
