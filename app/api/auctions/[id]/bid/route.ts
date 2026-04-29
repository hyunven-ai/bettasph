import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/auctions/[id]/bid — submit bid baru
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { bidder_name, bidder_wa, bidder_city, amount } = body;

  // Validasi input
  if (!bidder_name || !bidder_wa || !amount) {
    return NextResponse.json(
      { error: 'Nama, WhatsApp, dan nominal bid wajib diisi.' },
      { status: 400 }
    );
  }

  // Validasi format WA
  const waClean = bidder_wa.replace(/\D/g, '');
  if (waClean.length < 10 || waClean.length > 15) {
    return NextResponse.json(
      { error: 'Nomor WhatsApp tidak valid.' },
      { status: 400 }
    );
  }

  // Fetch auction
  const { data: auction, error: fetchErr } = await supabaseAdmin
    .from('auctions')
    .select('id, status, ends_at, starts_at, current_price, bid_increment, buy_now_price')
    .eq('id', id)
    .single();

  if (fetchErr || !auction) {
    return NextResponse.json({ error: 'Lelang tidak ditemukan.' }, { status: 404 });
  }

  // Validasi status
  if (auction.status !== 'active') {
    return NextResponse.json(
      { error: 'Lelang tidak sedang aktif.' },
      { status: 409 }
    );
  }

  // Validasi waktu
  const now = new Date();
  if (new Date(auction.ends_at) <= now) {
    await supabaseAdmin.from('auctions').update({ status: 'ended' }).eq('id', id);
    return NextResponse.json({ error: 'Waktu lelang telah berakhir.' }, { status: 409 });
  }

  // Validasi nominal bid
  const bidAmount = parseInt(amount);
  const minBid = auction.current_price + auction.bid_increment;

  if (bidAmount < minBid) {
    return NextResponse.json(
      {
        error: `Bid minimal Rp ${minBid.toLocaleString('id-ID')}`,
        min_bid: minBid,
        current_price: auction.current_price,
      },
      { status: 400 }
    );
  }

  // Insert bid — trigger di DB akan update current_price & bid_count otomatis
  const { data: bid, error: bidErr } = await supabaseAdmin
    .from('bids')
    .insert({
      auction_id: id,
      bidder_name: bidder_name.trim(),
      bidder_wa: waClean,
      bidder_city: bidder_city?.trim() || null,
      amount: bidAmount,
    })
    .select()
    .single();

  if (bidErr) return NextResponse.json({ error: bidErr.message }, { status: 500 });

  // Cek apakah ini Buy Now
  const isBuyNow = auction.buy_now_price && bidAmount >= auction.buy_now_price;
  if (isBuyNow) {
    await supabaseAdmin.from('auctions').update({
      status: 'ended',
      winner_name: bidder_name.trim(),
      winner_wa: waClean,
      winner_bid: bidAmount,
    }).eq('id', id);
  }

  return NextResponse.json({
    success: true,
    bid,
    is_buy_now: !!isBuyNow,
    new_price: bidAmount,
  }, { status: 201 });
}
