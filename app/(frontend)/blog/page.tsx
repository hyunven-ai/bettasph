import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: 'Blog & Edukasi | Bettasph',
  description: 'Artikel, tips perawatan, dan edukasi seputar ikan hias cupang, koi, dan arwana.',
};

export const revalidate = 0; // Disable cache so posts appear immediately

export default async function BlogPage() {
  const { data: posts, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="bg-[#050810] min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-6">Jurnal & Edukasi</h1>
          <p className="text-lg text-slate-400">
            Temukan panduan eksklusif cara merawat ikan hias kesayangan Anda agar mencapai puncak kualitas genetik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!posts || posts.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
              <p className="text-slate-500">Belum ada artikel edukasi yang diterbitkan saat ini.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col bg-[#0A0F1C] rounded-2xl border border-white/5 overflow-hidden hover:border-[var(--color-brand-aqua)]/50 transition-all duration-500">
                <div className="aspect-video w-full overflow-hidden bg-[#050810] relative flex items-center justify-center">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                       <span className="text-zinc-700 text-sm">Tidak ada gambar</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-[var(--color-brand-aqua)] uppercase tracking-wider border border-white/10">
                    {post.category || 'Artikel'}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.created_at)}</div>
                    <div className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</div>
                  </div>
                  
                  <h3 className="font-outfit text-xl font-bold text-white mb-3 group-hover:text-[var(--color-brand-aqua)] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center text-slate-300 font-semibold text-sm group-hover:text-white transition-all">
                    Eksplorasi Jurnal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:text-[var(--color-brand-aqua)] transition-transform" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


