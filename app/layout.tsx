import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { supabaseAdmin } from "@/lib/supabase-admin";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('seo_site_name, seo_description, seo_og_image, seo_twitter_handle, seo_title_template, seo_canonical_base')
    .limit(1)
    .single();

  const siteName = settings?.seo_site_name || "Ikanpedia.id";
  const desc = settings?.seo_description || "Beli Ikan Cupang, Koi, dan Arwana kualitas premium dengan harga terbaik.";

  // Default title for homepage (beranda)
  const defaultTitle = settings?.seo_title_template
    ? settings.seo_title_template.replace('%title%', 'Beranda').replace('%site_name%', siteName)
    : siteName;

  // Build Next.js %s template. IMPORTANT: if seo_title_template doesn't contain
  // '%title%', the replace() is a no-op and there's no '%s', which causes Next.js
  // to use a static string for every page, ignoring child generateMetadata.
  // We always validate that the final templateStr contains '%s'.
  let templateStr = settings?.seo_title_template
    ? settings.seo_title_template.replace('%title%', '%s').replace('%site_name%', siteName)
    : `%s | ${siteName}`;

  // Safety net: if the stored template had no %title% placeholder, fall back to
  // a safe default so child pages can still set their own titles.
  if (!templateStr.includes('%s')) {
    templateStr = `%s | ${siteName}`;
  }

  return {
    title: {
      default: defaultTitle,
      template: templateStr,
    },
    description: desc,
    openGraph: {
      title: siteName,
      description: desc,
      images: settings?.seo_og_image ? [{ url: settings.seo_og_image }] : [],
      url: settings?.seo_canonical_base || "https://ikanpedia.id",
    },
    twitter: {
      card: "summary_large_image",
      site: settings?.seo_twitter_handle || "",
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('analytics_ga_id, analytics_fb_pixel')
    .limit(1)
    .single();

  return (
    <html lang="id" className="scroll-smooth">
      <head />
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

