import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 0; // Disable cache

// --- SEO: generateMetadata dari data blog post ---
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;

  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, image_url, slug')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!post) return {};

  const { data: siteSettings } = await supabaseAdmin
    .from('site_settings')
    .select('seo_site_name, seo_canonical_base')
    .limit(1)
    .single();

  const siteName = siteSettings?.seo_site_name || "Ikanpedia.id";
  const baseUrl = siteSettings?.seo_canonical_base || "https://ikanpedia.id";

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || "";
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      images: post.image_url ? [{ url: post.image_url, alt: title }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !post) {
    notFound();
  }

  const { data: siteSettings } = await supabaseAdmin
    .from('site_settings')
    .select('seo_canonical_base, seo_site_name')
    .limit(1)
    .single();

  const baseUrl = siteSettings?.seo_canonical_base || "https://ikanpedia.id";
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const postTitle = post.meta_title || post.title;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="bg-[#050810] min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href="/blog" className="inline-flex items-center text-slate-400 hover:text-[var(--color-brand-aqua)] mb-10 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Artikel
        </Link>
        <article className="mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1 bg-blue-500/10 text-[var(--color-brand-aqua)] border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              {post.category || 'Artikel'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-outfit text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-8">
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" /> {formatDate(post.created_at)}</div>
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /> {post.author}</div>
              </div>
              {/* Share Button (client-side) */}
              <ShareButtons url={postUrl} title={postTitle} />
            </div>
          </div>
          
          {post.image_url && (
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl mb-12 border border-white/5 bg-[#0A0F1C]">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-auto block"
              />
            </div>
          )}

          {/* Render Rich Text Content */}
          <div 
            className="prose prose-slate prose-invert lg:prose-lg mx-auto prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl prose-img:border prose-img:border-white/10 max-w-none text-slate-300"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Tags */}
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-full text-xs font-medium hover:border-[var(--color-brand-aqua)]/50 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Share Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Bagikan artikel ini</p>
                <p className="text-xs text-slate-500">Bantu teman sesama pecinta ikan hias</p>
              </div>
              <ShareButtons url={postUrl} title={postTitle} large />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
