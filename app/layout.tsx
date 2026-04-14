import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
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
  
  // Provide the default title logic based on template
  const defaultTitle = settings?.seo_title_template 
    ? settings.seo_title_template.replace('%title%', 'Beranda').replace('%site_name%', siteName) 
    : siteName;

  // Next.js %s template format
  const templateStr = settings?.seo_title_template 
    ? settings.seo_title_template.replace('%title%', '%s').replace('%site_name%', siteName)
    : `%s | ${siteName}`;

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
      <head>
        {settings?.analytics_ga_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics_ga_id}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.analytics_ga_id}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

