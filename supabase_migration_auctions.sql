-- ============================================================
-- IKANPEDIA.ID — Auction System Migration (Tier 1 MVP)
-- Run this in Supabase SQL Editor
-- Safe to re-run (idempotent)
-- ============================================================

-- STEP 1: ENUM (skip jika sudah ada)
DO $$ BEGIN
  CREATE TYPE auction_status AS ENUM ('draft', 'scheduled', 'active', 'ended', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- STEP 2: Drop tabel lama (aman karena masih kosong)
-- Tabel lama punya skema berbeda (end_time, start_time, dll) — perlu recreate
DROP TABLE IF EXISTS auction_bids CASCADE;
DROP TABLE IF EXISTS bids        CASCADE;
DROP TABLE IF EXISTS auctions    CASCADE;

-- STEP 3: TABLE auctions (skema baru)
CREATE TABLE IF NOT EXISTS auctions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_name     TEXT        NOT NULL,
  species       TEXT,
  category      TEXT        NOT NULL DEFAULT 'betta',
  grade         TEXT,
  size_cm       NUMERIC(5,1),
  description   TEXT,
  image_urls    TEXT[]      DEFAULT '{}',
  video_url     TEXT,
  start_price   BIGINT      NOT NULL,
  bid_increment BIGINT      NOT NULL DEFAULT 10000,
  buy_now_price BIGINT,
  current_price BIGINT      NOT NULL,
  bid_count     INT         NOT NULL DEFAULT 0,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  status        auction_status NOT NULL DEFAULT 'draft',
  winner_name   TEXT,
  winner_wa     TEXT,
  winner_bid    BIGINT,
  is_paid       BOOLEAN     DEFAULT false,
  seller_name   TEXT        NOT NULL DEFAULT 'Admin',
  seller_wa     TEXT,
  views         INT         NOT NULL DEFAULT 0,
  is_featured   BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: TABLE bids
CREATE TABLE IF NOT EXISTS bids (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id  UUID        NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_name TEXT        NOT NULL,
  bidder_wa   TEXT        NOT NULL,
  bidder_city TEXT,
  amount      BIGINT      NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: INDEX
CREATE INDEX IF NOT EXISTS idx_auctions_status   ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_ends_at  ON auctions(ends_at);
CREATE INDEX IF NOT EXISTS idx_auctions_category ON auctions(category);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id   ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at   ON bids(created_at DESC);

-- STEP 5: FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION after_bid_inserted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auctions
  SET current_price = NEW.amount,
      bid_count     = bid_count + 1,
      updated_at    = NOW()
  WHERE id = NEW.auction_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_end_auctions()
RETURNS VOID AS $$
BEGIN
  UPDATE auctions SET status = 'ended'
  WHERE status = 'active' AND ends_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- STEP 6: TRIGGERS (drop dulu agar bisa re-run)
DROP TRIGGER IF EXISTS auctions_updated_at    ON auctions;
DROP TRIGGER IF EXISTS sync_auction_after_bid ON bids;

CREATE TRIGGER auctions_updated_at
  BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sync_auction_after_bid
  AFTER INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION after_bid_inserted();

-- STEP 7: RLS
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read auctions"      ON auctions;
DROP POLICY IF EXISTS "Service role manages auctions" ON auctions;
DROP POLICY IF EXISTS "Public can read bids"          ON bids;
DROP POLICY IF EXISTS "Public can place bids"         ON bids;

CREATE POLICY "Public can read auctions" ON auctions
  FOR SELECT USING (status IN ('active', 'scheduled', 'ended'));

CREATE POLICY "Service role manages auctions" ON auctions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read bids" ON bids
  FOR SELECT USING (true);

CREATE POLICY "Public can place bids" ON bids
  FOR INSERT WITH CHECK (true);

-- STEP 8: VIEW
CREATE OR REPLACE VIEW auction_summary AS
SELECT
  a.*,
  COALESCE(b.top_bidder_name, '-') AS top_bidder_name,
  COALESCE(b.top_bidder_wa,   '-') AS top_bidder_wa,
  EXTRACT(EPOCH FROM (a.ends_at - NOW()))::BIGINT AS seconds_remaining
FROM auctions a
LEFT JOIN LATERAL (
  SELECT bidder_name AS top_bidder_name, bidder_wa AS top_bidder_wa
  FROM bids WHERE auction_id = a.id
  ORDER BY amount DESC LIMIT 1
) b ON true;

-- STEP 9: SAMPLE DATA (hanya jika tabel kosong)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auctions LIMIT 1) THEN

    INSERT INTO auctions (
      fish_name, species, category, grade, size_cm, description,
      start_price, bid_increment, buy_now_price, current_price,
      starts_at, ends_at, status, seller_name, seller_wa, is_featured
    ) VALUES
    (
      'Betta Galaxy Halfmoon',
      'Betta splendens',
      'betta', 'S+', 6.5,
      'Betta Galaxy Halfmoon warna merah galaxy biru dengan ekor lebar sempurna. Sudah dikondisikan selama 2 minggu, makan aktif, sehat. Cocok untuk kontes.',
      150000, 10000, 450000, 150000,
      NOW(), NOW() + INTERVAL '3 days',
      'active', 'Admin Ikanpedia', '6281234567890', true
    ),
    (
      'Koi Kohaku 30cm',
      'Cyprinus rubrofuscus',
      'koi', 'A', 30.0,
      'Koi Kohaku pattern bagus, warna merah tajam di atas putih bersih. Ideal untuk kolam outdoor. Sudah dikarantina 1 minggu.',
      500000, 50000, 2000000, 500000,
      NOW() + INTERVAL '1 hour', NOW() + INTERVAL '5 days',
      'scheduled', 'Admin Ikanpedia', '6281234567890', false
    ),
    (
      'Arwana Silver 25cm',
      'Osteoglossum bicirrhosum',
      'arwana', 'B', 25.0,
      'Arwana Silver sehat dan aktif. Cocok untuk pemula yang ingin mulai pelihara arwana. Sudah makan pelet.',
      800000, 100000, NULL, 800000,
      NOW(), NOW() + INTERVAL '2 days',
      'active', 'Admin Ikanpedia', '6281234567890', true
    );

    RAISE NOTICE 'Sample data berhasil diinsert.';
  ELSE
    RAISE NOTICE 'Tabel sudah ada data, sample data dilewati.';
  END IF;
END $$;
