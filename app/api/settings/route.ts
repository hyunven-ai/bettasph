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
  darkMode: dbRec.darkmode ?? true,
  // SEO Fields
  seoTitleTemplate: dbRec.seo_title_template || '%title% | %site_name%',
  seoDescription: dbRec.seo_description || '',
  seoSiteName: dbRec.seo_site_name || 'Ikanpedia.id',
  seoOgImage: dbRec.seo_og_image || '',
  seoTwitterHandle: dbRec.seo_twitter_handle || '',
  seoRobotsTxt: dbRec.seo_robots_txt || 'User-agent: *\nAllow: /',
  seoSitemapUrl: dbRec.seo_sitemap_url || '',
  seoCanonicalBase: dbRec.seo_canonical_base || 'https://ikanpedia.id.com',
  // Analytics Fields
  analyticsGaId: dbRec.analytics_ga_id || '',
  analyticsFbPixel: dbRec.analytics_fb_pixel || '',
  analyticsTiktokPixel: dbRec.analytics_tiktok_pixel || '',
  analyticsGtmId: dbRec.analytics_gtm_id || ''
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
  darkmode: stateObj.darkMode,
  // SEO
  seo_title_template: stateObj.seoTitleTemplate,
  seo_description: stateObj.seoDescription,
  seo_site_name: stateObj.seoSiteName,
  seo_og_image: stateObj.seoOgImage,
  seo_twitter_handle: stateObj.seoTwitterHandle,
  seo_robots_txt: stateObj.seoRobotsTxt,
  seo_sitemap_url: stateObj.seoSitemapUrl,
  seo_canonical_base: stateObj.seoCanonicalBase,
  // Analytics
  analytics_ga_id: stateObj.analyticsGaId,
  analytics_fb_pixel: stateObj.analyticsFbPixel,
  analytics_tiktok_pixel: stateObj.analyticsTiktokPixel,
  analytics_gtm_id: stateObj.analyticsGtmId
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
      storeName: 'Ikanpedia.id',
      storeTagline: 'Kurator Ikan Hias Premium Indonesia',
      storeUrl: 'https://ikanpedia.id.com',
      whatsapp: '+6281234567890',
      telegram: 'Ikanpedia.idOfficial',
      email: 'info@ikanpedia.id.com',
      address: 'Jakarta Barat, Indonesia',
      instagram: '@ikanpedia.id_official',
      orderNotif: true,
      lowStockNotif: true,
      emailDigest: false,
      maintenanceMode: false,
      primaryColor: '#8b5cf6',
      darkMode: true,
      // Default SEO
      seoTitleTemplate: '%title% | %site_name%',
      seoDescription: 'Temukan panduan lengkap seputar ikan hias, tips perawatan, dan jual beli ikan hias terpercaya hanya di Ikanpedia.id. Cocok untuk pemula hingga kolektor.',
      seoSiteName: 'Ikanpedia.id – Edukasi & Marketplace Ikan Hias Terlengkap di Indonesia',
      seoOgImage: '',
      seoTwitterHandle: '',
      seoRobotsTxt: 'User-agent: *\nAllow: /',
      seoSitemapUrl: '',
      seoCanonicalBase: 'https://ikanpedia.id.com',
      // Default Analytics
      analyticsGaId: '',
      analyticsFbPixel: '',
      analyticsTiktokPixel: '',
      analyticsGtmId: ''
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

