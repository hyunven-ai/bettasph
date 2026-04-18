-- Migration: Tambah kolom karakteristik ke tabel fish_catalog
ALTER TABLE fish_catalog
  ADD COLUMN IF NOT EXISTS characteristic TEXT DEFAULT NULL;
