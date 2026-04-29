import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'auction-images';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/upload — upload gambar ke Supabase Storage
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) || 'auctions';

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
  }

  // Validasi tipe file
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipe file tidak didukung. Gunakan: JPG, PNG, WebP, atau GIF.` },
      { status: 400 }
    );
  }

  // Validasi ukuran file
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `Ukuran file melebihi batas 5MB. File kamu: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
      { status: 400 }
    );
  }

  // Generate nama file unik
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `${folder}/${timestamp}-${random}.${ext}`;

  // Convert File ke ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload ke Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return NextResponse.json({
    url: publicUrl,
    path: data.path,
    size: file.size,
    type: file.type,
  });
}

// DELETE /api/upload?path=... — hapus gambar dari storage
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path diperlukan.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
