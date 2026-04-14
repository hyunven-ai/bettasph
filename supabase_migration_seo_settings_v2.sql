-- Script Migrasi: Tambah Kolom SEO & Analytics ke site_settings
-- Jalankan script ini di Supabase SQL Editor

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS seo_title_template TEXT DEFAULT '%title% | %site_name%',
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Temukan panduan lengkap seputar ikan hias, tips perawatan, dan jual beli ikan hias terpercaya hanya di Ikanpedia.id. Cocok untuk pemula hingga kolektor.',
ADD COLUMN IF NOT EXISTS seo_site_name TEXT DEFAULT 'Ikanpedia.id – Edukasi & Marketplace Ikan Hias Terlengkap di Indonesia',
ADD COLUMN IF NOT EXISTS seo_og_image TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS seo_twitter_handle TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS seo_robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /',
ADD COLUMN IF NOT EXISTS seo_sitemap_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS seo_canonical_base TEXT DEFAULT 'https://ikanpedia.id.com',
ADD COLUMN IF NOT EXISTS analytics_ga_id TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS analytics_fb_pixel TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS analytics_tiktok_pixel TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS analytics_gtm_id TEXT DEFAULT '';

-- Optional: Inisialisasi data default jika kolom baru masih kosong pada baris yang ada
UPDATE site_settings 
SET 
  seo_title_template = COALESCE(seo_title_template, '%title% | %site_name%'),
  seo_site_name = COALESCE(seo_site_name, 'Ikanpedia.id – Edukasi & Marketplace Ikan Hias Terlengkap di Indonesia'),
  seo_description = COALESCE(seo_description, 'Temukan panduan lengkap seputar ikan hias, tips perawatan, dan jual beli ikan hias terpercaya hanya di Ikanpedia.id. Cocok untuk pemula hingga kolektor.'),
  seo_robots_txt = COALESCE(seo_robots_txt, 'User-agent: *\nAllow: /'),
  seo_canonical_base = COALESCE(seo_canonical_base, 'https://ikanpedia.id.com')
WHERE id = 1;
