import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    // Hanya izinkan gambar
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Format file tidak didukung.' }, { status: 400 });
    }

    // Hitung ukuran (contoh: "1.2 MB" atau "300 KB")
    const bytes = file.size;
    const isMB = bytes >= 1024 * 1024;
    const sizeStr = isMB 
      ? (bytes / (1024 * 1024)).toFixed(1) + ' MB' 
      : Math.round(bytes / 1024) + ' KB';

    // Buat nama file unik
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File into ArrayBuffer/Blob for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload ke Supabase Storage (bucket: 'gallery')
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('gallery')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      return NextResponse.json({ error: 'Gagal mengunggah ke Storage Supabase. Pastikan Bucket "gallery" sudah dibuat dan public.' }, { status: 500 });
    }

    // 2. Dapatkan URL Public
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('gallery')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Simpan metadatanya ke tabel 'gallery'
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('gallery')
      .insert([{ 
        url: publicUrl, 
        filename: file.name,
        size: sizeStr
      }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(dbData, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem internal.' }, { status: 500 });
  }
}
