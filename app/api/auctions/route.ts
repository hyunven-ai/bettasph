import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/auctions — list lelang aktif/terjadwal/selesai
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'active';
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabaseAdmin
    .from('auctions')
    .select('*', { count: 'exact' })
    .order('is_featured', { ascending: false })
    .order('ends_at', { ascending: true })
    .range(offset, offset + limit - 1);

  // Filter status
  if (status === 'all') {
    query = query.neq('status', 'draft');
  } else {
    query = query.eq('status', status);
  }

  if (category) query = query.eq('category', category);
  if (featured === 'true') query = query.eq('is_featured', true);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count, limit, offset });
}

// POST /api/auctions — buat lelang baru (admin only via service_role)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    fish_name, species, category, grade, size_cm, description,
    image_urls, video_url,
    start_price, bid_increment, buy_now_price,
    starts_at, ends_at,
    seller_name, seller_wa, is_featured
  } = body;

  if (!fish_name || !start_price || !starts_at || !ends_at || !category) {
    return NextResponse.json(
      { error: 'Field wajib: fish_name, start_price, category, starts_at, ends_at' },
      { status: 400 }
    );
  }

  const startPrice = parseInt(start_price);
  const startsAtDate = new Date(starts_at);
  const status = startsAtDate > new Date() ? 'scheduled' : 'active';

  const { data, error } = await supabaseAdmin.from('auctions').insert({
    fish_name,
    species: species || null,
    category,
    grade: grade || null,
    size_cm: size_cm ? parseFloat(size_cm) : null,
    description: description || null,
    image_urls: image_urls || [],
    video_url: video_url || null,
    start_price: startPrice,
    bid_increment: parseInt(bid_increment) || 10000,
    buy_now_price: buy_now_price ? parseInt(buy_now_price) : null,
    current_price: startPrice,
    starts_at,
    ends_at,
    status,
    seller_name: seller_name || 'Admin',
    seller_wa: seller_wa || null,
    is_featured: is_featured || false,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
