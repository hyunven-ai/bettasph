import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, excerpt, content, category, author, image_url, published } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Judul artikel wajib diisi.' }, { status: 400 });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert([{ 
      title: title.trim(),
      slug,
      excerpt: excerpt || '',
      content: content || '',
      category: category || 'Uncategorized',
      author: author || 'Admin',
      image_url: image_url || null,
      published: published || false
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
