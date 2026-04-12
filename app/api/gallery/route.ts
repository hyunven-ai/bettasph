import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, filename, size } = body;

  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('gallery')
    .insert([{ 
      url: url.trim(), 
      filename: filename?.trim() || url.split('/').pop()?.split('?')[0] || 'image.jpg',
      size: size || '— KB'
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
