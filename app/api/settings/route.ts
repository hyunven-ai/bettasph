import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to map DB columns (lowercase) to JS state (camelCase)
const mapDbToState = (dbRec: any) => ({
  storeName: dbRec.storename || '',
  storeTagline: dbRec.storetagline || '',
  storeUrl: dbRec.storeurl || '',
  whatsapp: dbRec.whatsapp || '',
  telegram: dbRec.telegram || '',
  email: dbRec.email || '',
  address: dbRec.address || '',
  instagram: dbRec.instagram || '',
  orderNotif: dbRec.ordernotif ?? true,
  lowStockNotif: dbRec.lowstocknotif ?? true,
  emailDigest: dbRec.emaildigest ?? false,
  maintenanceMode: dbRec.maintenancemode ?? false,
  primaryColor: dbRec.primarycolor || '#6366f1',
  darkMode: dbRec.darkmode ?? true
});

// Helper to map JS state (camelCase) to DB columns (lowercase)
const mapStateToDb = (stateObj: any) => ({
  storename: stateObj.storeName,
  storetagline: stateObj.storeTagline,
  storeurl: stateObj.storeUrl,
  whatsapp: stateObj.whatsapp,
  telegram: stateObj.telegram,
  email: stateObj.email,
  address: stateObj.address,
  instagram: stateObj.instagram,
  ordernotif: stateObj.orderNotif,
  lowstocknotif: stateObj.lowStockNotif,
  emaildigest: stateObj.emailDigest,
  maintenancemode: stateObj.maintenanceMode,
  primarycolor: stateObj.primaryColor,
  darkmode: stateObj.darkMode
});

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Jika belum ada, kembalikan default
  if (!data) {
    return NextResponse.json({
      storeName: 'Bettasph',
      storeTagline: 'Kurator Ikan Hias Premium Indonesia',
      storeUrl: 'https://bettasph.com',
      whatsapp: '+6281234567890',
      telegram: 'BettasphOfficial',
      email: 'info@bettasph.com',
      address: 'Jakarta Barat, Indonesia',
      instagram: '@bettasph_official',
      orderNotif: true,
      lowStockNotif: true,
      emailDigest: false,
      maintenanceMode: false,
      primaryColor: '#8b5cf6',
      darkMode: true
    });
  }

  return NextResponse.json(mapDbToState(data));
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const dbPayload = mapStateToDb(body);
  
  // Karena kita hanya butuh 1 setting global, kita asumsikan id = 1
  const { data: existing, error: existError } = await supabaseAdmin
    .from('site_settings')
    .select('id')
    .limit(1)
    .single();

  if (!existing) {
    // Insert jika belum ada sama sekali
    const { data: newRow, error } = await supabaseAdmin
      .from('site_settings')
      .insert([{ id: 1, ...dbPayload }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapDbToState(newRow));
  } else {
    // Update jika sudah ada
    const { data: updated, error } = await supabaseAdmin
      .from('site_settings')
      .update(dbPayload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapDbToState(updated));
  }
}

