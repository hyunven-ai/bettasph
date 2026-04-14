import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, excerpt, content, category, author, image_url, published, meta_title, meta_description, focus_keyword, tags } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Judul artikel wajib diisi.' }, { status: 400 });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update({ 
      title: title.trim(),
      slug,
      excerpt: excerpt || '',
      content: content || '',
      category: category || 'Uncategorized',
      author: author || 'Admin',
      image_url: image_url || null,
      published: published || false,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      focus_keyword: focus_keyword || null,
      tags: tags || []
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
