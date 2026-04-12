import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('seo_pages')
    .select('*')
    .order('path', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { path, title, description, keywords, og_image } = body;

  if (!path?.trim()) {
    return NextResponse.json({ error: 'Path wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('seo_pages')
    .insert([{ 
      path: path.trim(),
      title: title || '',
      description: description || '',
      keywords: keywords || '',
      og_image: og_image || '',
      indexed: false
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
