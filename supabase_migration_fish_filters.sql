-- Migration: Tambah kolom atribut filter ke tabel fish_catalog
-- Jalankan ini di Supabase SQL Editor

ALTER TABLE fish_catalog
  ADD COLUMN IF NOT EXISTS grade       TEXT DEFAULT 'Standard',
  ADD COLUMN IF NOT EXISTS purpose     TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS color       TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gender      TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS certified   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'Siap Kirim',
  ADD COLUMN IF NOT EXISTS badge       TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS featured    BOOLEAN DEFAULT false;

-- Optional: tambah index untuk filter cepat
CREATE INDEX IF NOT EXISTS idx_fish_grade    ON fish_catalog (grade);
CREATE INDEX IF NOT EXISTS idx_fish_purpose  ON fish_catalog (purpose);
CREATE INDEX IF NOT EXISTS idx_fish_badge    ON fish_catalog (badge);
CREATE INDEX IF NOT EXISTS idx_fish_featured ON fish_catalog (featured);

-- Komentar nilai yang valid:
-- grade: 'Show Grade' | 'Premium' | 'Standard'
-- purpose: 'Pemula' | 'Kolektor' | 'Kontes' | 'Breeding'
-- color: 'Merah' | 'Putih' | 'Hitam' | 'Mix'
-- gender: 'Jantan' | 'Betina'
-- health_status: 'Karantina' | 'Siap Kirim'
-- badge: 'Featured' | 'Best Seller' | 'Genetik Unggul' | 'Juara Kontes' | 'Rare / Limited'
