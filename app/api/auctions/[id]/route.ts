import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

// GET /api/auctions/[id] — detail lelang + bid history
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // Fetch auction
  const { data: auction, error: auctionErr } = await supabaseAdmin
    .from('auctions')
    .select('*')
    .eq('id', id)
    .single();

  if (auctionErr || !auction) {
    return NextResponse.json({ error: 'Lelang tidak ditemukan' }, { status: 404 });
  }

  // Auto-end jika waktu sudah habis
  if (auction.status === 'active' && new Date(auction.ends_at) <= new Date()) {
    await supabaseAdmin
      .from('auctions')
      .update({ status: 'ended' })
      .eq('id', id);
    auction.status = 'ended';
  }

  // Auto-activate jika sudah waktunya mulai
  if (auction.status === 'scheduled' && new Date(auction.starts_at) <= new Date()) {
    await supabaseAdmin
      .from('auctions')
      .update({ status: 'active' })
      .eq('id', id);
    auction.status = 'active';
  }

  // Increment view count (fire and forget)
  supabaseAdmin
    .from('auctions')
    .update({ views: auction.views + 1 })
    .eq('id', id)
    .then(() => {});

  // Fetch bid history (top 20)
  const { data: bids } = await supabaseAdmin
    .from('bids')
    .select('id, bidder_name, bidder_city, amount, created_at')
    .eq('auction_id', id)
    .order('amount', { ascending: false })
    .limit(20);

  return NextResponse.json({ auction, bids: bids || [] });
}

// PATCH /api/auctions/[id] — update data lelang (admin)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('auctions')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// DELETE /api/auctions/[id] — hapus lelang (admin)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('auctions')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
