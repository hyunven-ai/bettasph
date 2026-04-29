import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/ai/price-suggestion?category=betta&grade=S&size_cm=6
// Memberikan saran harga awal lelang berdasarkan histori transaksi
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const grade = searchParams.get('grade');
  const sizeCm = searchParams.get('size_cm') ? parseFloat(searchParams.get('size_cm')!) : null;

  if (!category) {
    return NextResponse.json({ error: 'Parameter category diperlukan.' }, { status: 400 });
  }

  // Query histori lelang yang sudah selesai dengan bid masuk
  let query = supabaseAdmin
    .from('auctions')
    .select('start_price, current_price, bid_count, bid_increment, ends_at, grade, size_cm')
    .eq('category', category)
    .eq('status', 'ended')
    .gt('bid_count', 0)
    .order('ends_at', { ascending: false })
    .limit(50);

  // Filter grade jika ada
  if (grade) query = query.eq('grade', grade);

  const { data: auctions, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Tidak ada histori — pakai fallback harga default per kategori+grade
  if (!auctions || auctions.length === 0) {
    const fallback = getFallbackPrice(category, grade, sizeCm);
    return NextResponse.json({
      has_history: false,
      suggested_start: fallback.start,
      suggested_increment: fallback.increment,
      suggested_buy_now: fallback.buyNow,
      confidence: 'low',
      based_on: 0,
      message: 'Belum ada histori lelang untuk kategori ini. Menggunakan estimasi pasar.',
      range: fallback.range,
    });
  }

  // Hitung statistik dari histori
  const winningPrices = auctions.map((a) => a.current_price);
  const startPrices = auctions.map((a) => a.start_price);

  const avgWinning = Math.round(winningPrices.reduce((s, p) => s + p, 0) / winningPrices.length);
  const avgStart = Math.round(startPrices.reduce((s, p) => s + p, 0) / startPrices.length);
  const minWinning = Math.min(...winningPrices);
  const maxWinning = Math.max(...winningPrices);
  const medianWinning = getMedian(winningPrices);

  // Faktor naik harga rata-rata
  const avgPriceRise = auctions.reduce((sum, a) => {
    return sum + ((a.current_price - a.start_price) / a.start_price);
  }, 0) / auctions.length;

  // Saran harga awal: 70% dari median harga menang (biar ada drama bidding)
  const suggestedStart = roundToNearest(medianWinning * 0.65, 10000);
  
  // Saran increment: 5% dari median, min 5000
  const suggestedIncrement = Math.max(5000, roundToNearest(medianWinning * 0.05, 5000));
  
  // Saran buy now: 120% dari median
  const suggestedBuyNow = roundToNearest(medianWinning * 1.2, 10000);

  // Trend: bandingkan 10 lelang terakhir vs sebelumnya
  let trend: 'naik' | 'turun' | 'stabil' = 'stabil';
  let trendPct = 0;
  if (auctions.length >= 10) {
    const recent = auctions.slice(0, Math.floor(auctions.length / 2));
    const older = auctions.slice(Math.floor(auctions.length / 2));
    const recentAvg = recent.reduce((s, a) => s + a.current_price, 0) / recent.length;
    const olderAvg = older.reduce((s, a) => s + a.current_price, 0) / older.length;
    trendPct = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
    if (trendPct > 5) trend = 'naik';
    else if (trendPct < -5) trend = 'turun';
  }

  const confidence = auctions.length >= 10 ? 'high' : auctions.length >= 5 ? 'medium' : 'low';

  return NextResponse.json({
    has_history: true,
    suggested_start: suggestedStart,
    suggested_increment: suggestedIncrement,
    suggested_buy_now: suggestedBuyNow,
    confidence,
    based_on: auctions.length,
    stats: {
      avg_winning: avgWinning,
      median_winning: medianWinning,
      min_winning: minWinning,
      max_winning: maxWinning,
      avg_start: avgStart,
      avg_price_rise_pct: Math.round(avgPriceRise * 100),
    },
    trend: {
      direction: trend,
      percent: trendPct,
    },
    range: {
      min: minWinning,
      max: maxWinning,
      label: `Rp ${minWinning.toLocaleString('id-ID')} – Rp ${maxWinning.toLocaleString('id-ID')}`,
    },
    message: `Berdasarkan ${auctions.length} lelang ${category}${grade ? ` grade ${grade}` : ''} terakhir.`,
  });
}

// ---- Helpers ----

function getMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

// Harga default jika belum ada histori
function getFallbackPrice(category: string, grade: string | null, sizeCm: number | null) {
  const BASE: Record<string, { start: number; increment: number; buyNow: number; range: { min: number; max: number; label: string } }> = {
    betta: {
      start: 100000, increment: 10000, buyNow: 400000,
      range: { min: 50000, max: 2000000, label: 'Rp 50.000 – Rp 2.000.000' },
    },
    koi: {
      start: 300000, increment: 50000, buyNow: 1500000,
      range: { min: 100000, max: 20000000, label: 'Rp 100.000 – Rp 20.000.000' },
    },
    arwana: {
      start: 800000, increment: 100000, buyNow: 3000000,
      range: { min: 500000, max: 100000000, label: 'Rp 500.000 – Rp 100.000.000' },
    },
    guppy: {
      start: 30000, increment: 5000, buyNow: 150000,
      range: { min: 10000, max: 500000, label: 'Rp 10.000 – Rp 500.000' },
    },
    other: {
      start: 50000, increment: 10000, buyNow: 200000,
      range: { min: 10000, max: 5000000, label: 'Rp 10.000 – Rp 5.000.000' },
    },
  };

  const base = BASE[category] || BASE.other;

  // Multiplier berdasarkan grade
  const gradeMultiplier: Record<string, number> = {
    'S+': 3.0, 'S': 2.2, 'A': 1.5, 'B': 1.0, 'C': 0.7,
  };
  const mult = grade ? (gradeMultiplier[grade] || 1.0) : 1.0;

  // Multiplier berdasarkan ukuran (lebih besar = lebih mahal)
  const sizeMult = sizeCm ? Math.max(1, sizeCm / 15) : 1;

  return {
    start: roundToNearest(base.start * mult * sizeMult, 10000),
    increment: base.increment,
    buyNow: roundToNearest(base.buyNow * mult * sizeMult, 50000),
    range: base.range,
  };
}
