import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";

export const revalidate = 0; // Disable cache

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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="bg-[#050810] min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

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
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-b border-white/10 pb-8">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" /> {formatDate(post.created_at)}</div>
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /> {post.author}</div>
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
        </article>
      </div>
    </div>
  );
}
