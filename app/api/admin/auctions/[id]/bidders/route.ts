import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/auctions/[id]/bidders
// Returns semua bidder dengan info kontak (admin only)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // Fetch auction info
  const { data: auction, error: auctionErr } = await supabaseAdmin
    .from('auctions')
    .select('id, fish_name, category, grade, status, current_price, bid_count, starts_at, ends_at, seller_name')
    .eq('id', id)
    .single();

  if (auctionErr || !auction) {
    return NextResponse.json({ error: 'Lelang tidak ditemukan' }, { status: 404 });
  }

  // Fetch semua bid dengan info kontak lengkap
  const { data: bids, error: bidsErr } = await supabaseAdmin
    .from('bids')
    .select('id, bidder_name, bidder_wa, bidder_city, amount, created_at')
    .eq('auction_id', id)
    .order('amount', { ascending: false });

  if (bidsErr) {
    return NextResponse.json({ error: bidsErr.message }, { status: 500 });
  }

  // Deduplicate: ambil bid tertinggi per bidder_wa
  const uniqueBidders = new Map<string, typeof bids[0]>();
  for (const bid of bids || []) {
    const key = bid.bidder_wa || bid.bidder_name;
    if (!uniqueBidders.has(key) || (uniqueBidders.get(key)!.amount < bid.amount)) {
      uniqueBidders.set(key, bid);
    }
  }

  const bidderList = Array.from(uniqueBidders.values()).sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    auction,
    bidders: bidderList,
    total_unique_bidders: bidderList.length,
    total_bids: bids?.length || 0,
    winner: bidderList[0] || null,
  });
}
