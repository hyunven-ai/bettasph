import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, ShieldCheck, Truck, Droplet, Star, Award, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FadeIn } from "@/components/FadeIn";

export default async function Home() {
  const { data } = await supabase.from('fish_catalog').select('*').limit(4);
  const popularFish = data?.map((item: any) => ({
    ...item,
    imageUrl: item.image_url
  })) || [];

  return (
    <div className="bg-[#0B1120]">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — Full Viewport Dark Immersive
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-x-clip text-white">
        {/* Ambient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] rounded-full bg-[var(--color-brand-aqua)] opacity-[0.06] blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600 opacity-[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-600 opacity-[0.05] blur-[100px] pointer-events-none" />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAlIiBoZWlnaHQ9IjMwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 relative z-10 w-full">
          {/* Stack on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">

            {/* LEFT — Copy */}
            <div className="space-y-8 lg:space-y-10 max-w-xl mx-auto lg:mx-0">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--color-brand-aqua)]/25 bg-[var(--color-brand-aqua)]/8 backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-aqua)] animate-pulse" />
                  <span className="text-[var(--color-brand-aqua)] text-xs font-bold tracking-[0.18em] uppercase">Stok Eksklusif Tersedia Sekarang</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h1 className="font-outfit font-black leading-[1.0] tracking-tighter text-5xl md:text-6xl lg:text-7xl">
                  Mahakarya<br />
                  <span className="text-gradient">Hidup</span> dari<br />
                  Kedalaman Air.
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-md">
                  Spesialis Cupang, Koi, dan Arwana grade kontes — dikurasi
                  langsung oleh expert untuk koleksi eksklusif Anda.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/ikan"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--color-brand-aqua)] hover:bg-[#1acc8d] text-white font-black rounded-2xl shadow-[0_0_30px_rgba(32,201,151,0.3)] hover:shadow-[0_0_50px_rgba(32,201,151,0.5)] transition-all duration-500 text-base"
                  >
                    Jelajahi Koleksi
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/blog"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm bg-white/5 text-base"
                  >
                    Library Edukasi
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </FadeIn>

              {/* Social Proof Stats */}
              <FadeIn delay={0.5}>
                <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
                  {[
                    { num: "500+", label: "Koleksi Aktif" },
                    { num: "100%", label: "Garansi DOA" },
                    { num: "14 Hari", label: "Karantina" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-outfit text-2xl font-black text-white tracking-tighter">{stat.num}</p>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* RIGHT — Hero Image (visible on ALL screen sizes) */}
            <div className="relative flex items-center justify-center order-first lg:order-last">
              <FadeIn delay={0.3} direction="up">
                {/* Main hero image — full aspect ratio */}
                <div className="relative w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[540px] mx-auto">
                  {/* Glow underneath */}
                  <div className="absolute inset-x-8 bottom-0 h-3/4 bg-[var(--color-brand-aqua)]/20 blur-[80px] rounded-full -z-10" />

                  <div className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                    <video
                      src="https://i.imgur.com/qKKdDMT.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full aspect-[3/4] lg:aspect-[4/5] object-cover object-center animate-float"
                    />
                    {/* Gradient overlay bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/60 to-transparent" />

                    {/* Bottom caption overlay */}
                    <div className="absolute bottom-5 left-5 right-5 lg:bottom-6 lg:left-6 lg:right-6">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Featured — Grade S</p>
                      <p className="text-white font-outfit font-bold text-base lg:text-xl tracking-tight">Halfmoon Rosetail Premium</p>
                    </div>
                  </div>

                  {/* Floating badge — Grade (adjust position for mobile) */}
                  <div className="absolute -top-4 -left-4 lg:-top-6 lg:-left-8 glass-panel-dark px-4 py-3 lg:px-5 lg:py-4 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/5 animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs lg:text-sm leading-none">Grade Kontes</p>
                      <p className="text-slate-400 text-[10px] lg:text-xs mt-1">Genetik Terjamin</p>
                    </div>
                  </div>

                  {/* Floating badge — BSC (hidden on small mobile, shown from sm up) */}
                  <div className="hidden sm:flex absolute -right-4 lg:-right-6 top-1/3 glass-panel-dark px-4 py-3 lg:px-5 lg:py-4 rounded-2xl items-center gap-3 shadow-2xl border border-white/5 animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }}>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[var(--color-brand-aqua)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-brand-aqua)]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs lg:text-sm leading-none">Sertifikasi BSC</p>
                      <p className="text-slate-400 text-[10px] lg:text-xs mt-1">Standar Premium</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#080C1A] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRUST STRIPS — 3 Feature Cards
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#080C1A] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Garansi DOA 100%",
                  desc: "Klaim full refund tanpa pertanyaan jika ikan mengalami Death on Arrival saat diterima.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  border: "border-emerald-400/15",
                },
                {
                  icon: Truck,
                  title: "Packing Militer",
                  desc: "Oksigen full-pressure + insulasi suhu ganda. Tahan hingga 5 hari perjalanan udara tanpa stres.",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  border: "border-blue-400/15",
                },
                {
                  icon: Droplet,
                  title: "Karantina 14 Hari",
                  desc: "Setiap ikan melewati pemantauan intensif 14 hari bebas penyakit sebelum kurir menjemput.",
                  color: "text-[var(--color-brand-aqua)]",
                  bg: "bg-[var(--color-brand-aqua)]/10",
                  border: "border-[var(--color-brand-aqua)]/15",
                },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={0.1 + i * 0.1} fullWidth>
                  <div className={`p-8 rounded-3xl border ${item.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-500 group flex flex-col gap-5`}>
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-white text-xl tracking-tight mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BENTO GRID — Premium Collection Showcase
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#080C1A] py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <div className="mb-16 max-w-xl">
              <p className="text-[var(--color-brand-aqua)] text-xs font-black uppercase tracking-[0.3em] mb-4">Koleksi Unggulan</p>
              <h2 className="font-outfit font-black text-4xl md:text-5xl text-white tracking-tighter leading-tight">
                Pilihan dari<br /><span className="text-gradient">Kurator Kami.</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Big card - spans 2 */}
            <FadeIn delay={0.2} className="lg:col-span-2">
              <div className="relative rounded-[2.5rem] overflow-hidden group h-[420px] border border-white/5 cursor-pointer">
                <img
                  src="https://dgocoeiqmqnkmwphorzy.supabase.co/storage/v1/object/public/gallery/1776026554039-lv1d3g.jpg"
                  alt="Arwana Premium"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[2000ms] ease-senior"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <div className="mb-4">
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em]">High-End Collection</span>
                  </div>
                  <h3 className="font-outfit font-black text-4xl text-white tracking-tighter">Eksklusif Arwana<br />Super Red</h3>
                  <Link href="/ikan" className="mt-4 inline-flex items-center gap-2 text-[var(--color-brand-aqua)] font-bold text-sm group/link hover:text-white transition-colors">
                    Lihat Koleksi <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Tall card */}
            <FadeIn delay={0.3} fullWidth>
              <div className="relative rounded-[2.5rem] overflow-hidden group h-[420px] border border-white/5 cursor-pointer">
                <img
                  src="https://dgocoeiqmqnkmwphorzy.supabase.co/storage/v1/object/public/gallery/1776091669957-d4fs5s.jpg"
                  alt="Koi Premium"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[2000ms] ease-senior"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <p className="text-[var(--color-brand-aqua)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Koleksi Koi</p>
                  <h3 className="font-outfit font-black text-3xl text-white tracking-tighter">Kohaku Grade A</h3>
                </div>
              </div>
            </FadeIn>

            {/* Dark Stat card */}
            <FadeIn delay={0.4} fullWidth>
              <div className="rounded-[2.5rem] bg-gradient-to-br from-[var(--color-brand-aqua)]/15 to-transparent border border-[var(--color-brand-aqua)]/15 p-10 flex flex-col justify-between h-[280px] group hover:border-[var(--color-brand-aqua)]/30 transition-colors">
                <div className="w-14 h-14 bg-[var(--color-brand-aqua)]/15 rounded-2xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-[var(--color-brand-aqua)] fill-[var(--color-brand-aqua)]" />
                </div>
                <div>
                  <p className="font-outfit font-black text-5xl text-white tracking-tighter mb-2">500+</p>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">Koleksi ikan premium dengan sertifikasi gentik internasional siap kirim ke seluruh Indonesia.</p>
                </div>
              </div>
            </FadeIn>

            {/* Wide feature card - spans 2 */}
            <FadeIn delay={0.5} className="lg:col-span-2">
              <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-10 flex flex-col md:flex-row gap-8 items-center h-[280px] hover:bg-white/[0.04] transition-colors group">
                <div className="w-20 h-20 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-3xl text-white tracking-tight mb-3">Garansi Ikan Hidup 100%</h3>
                  <p className="text-slate-500 text-base leading-relaxed">
                    Klaim uang kembali penuh tanpa ribet jika ikan mengalami{" "}
                    <em className="text-slate-300 not-italic font-semibold">Death on Arrival</em>{" "}
                    (DOA). Keamanan berbelanja Anda adalah janji kami.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          POPULAR PRODUCTS — Dark Showcase Section
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#050810] relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[700px] h-[700px] rounded-full bg-[var(--color-brand-aqua)] opacity-[0.04] blur-[180px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <FadeIn delay={0.1}>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-lg">
                <p className="text-[var(--color-brand-aqua)] text-xs font-black uppercase tracking-[0.3em] mb-4">Terpopuler</p>
                <h2 className="font-outfit font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tighter leading-[1.1]">
                  Etalase<br /><span className="text-gradient">Premium.</span>
                </h2>
              </div>
              <Link
                href="/ikan"
                className="group flex items-center gap-3 text-[var(--color-brand-aqua)] font-bold text-base hover:text-white transition-all duration-300 border border-[var(--color-brand-aqua)]/30 px-6 py-3 rounded-full hover:border-white/30 hover:bg-white/5"
              >
                Lihat Semua Koleksi
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFish.map((fish: any, index: number) => (
              <FadeIn key={fish.id} delay={0.2 + index * 0.1}>
                <ProductCard product={fish} />
              </FadeIn>
            ))}
            {popularFish.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <div className="inline-block px-8 py-5 border border-white/5 rounded-3xl bg-white/[0.02] text-slate-600 font-medium text-sm">
                  Koleksi sedang dipersiapkan di server...
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA BOTTOM BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#050810] py-16 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <div className="relative rounded-[3rem] overflow-hidden border border-[var(--color-brand-aqua)]/15 bg-gradient-to-br from-[var(--color-brand-aqua)]/10 via-[#0B1120] to-blue-900/10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[var(--color-brand-aqua)]/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="relative z-10 max-w-xl">
                <h2 className="font-outfit font-black text-3xl md:text-4xl text-white tracking-tighter mb-4">Siap Menemukan Koleksi<br />Impian Anda?</h2>
                <p className="text-slate-400 text-base leading-relaxed">Jelajahi ratusan koleksi ikan premium kami dan temukan spesies yang tepat untuk ekosistem Anda.</p>
              </div>
              <div className="relative z-10 flex flex-shrink-0 flex-col gap-4">
                <Link
                  href="/ikan"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--color-brand-aqua)] hover:bg-[#1acc8d] text-white font-black rounded-2xl shadow-[0_0_30px_rgba(32,201,151,0.35)] hover:shadow-[0_0_50px_rgba(32,201,151,0.6)] transition-all duration-500 text-lg"
                >
                  Buka Katalog Sekarang
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
