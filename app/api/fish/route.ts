import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/fish — ambil semua data
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('fish_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/fish — tambah data baru
export async function POST(req: NextRequest) {
  const body = await req.json();

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const slug = generateSlug(body.name);

  const { data, error } = await supabaseAdmin
    .from('fish_catalog')
    .insert([{
      name: body.name,
      category: body.category,
      price: parseInt(body.price),
      size: body.size,
      image_url: body.image_url,
      stock: parseInt(body.stock),
      description: body.description,
      slug: slug,
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
