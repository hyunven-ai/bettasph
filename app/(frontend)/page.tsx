import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, ShieldCheck, Truck, Droplet, Star } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data } = await supabase.from('fish_catalog').select('*').limit(4);
  const popularFish = data?.map((item: any) => ({
    ...item,
    imageUrl: item.image_url
  })) || [];

  return (
    <div className="bg-slate-50">
      {/* Premium Dark Hero Section with Glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0B1120] text-white overflow-hidden rounded-b-[3rem] shadow-2xl z-10">
        {/* Abstract Gradient Orbs */}
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[500px] h-[500px] rounded-full bg-[var(--color-brand-aqua)] opacity-15 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600 opacity-20 blur-[100px] mix-blend-screen"></div>

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522069169874-c63ae245cc9f?auto=format&fit=crop&q=80')] opacity-[0.05] bg-cover bg-center"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center mt-16">
          <div className="space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-brand-aqua)]/30 bg-[var(--color-brand-aqua)]/10 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-aqua)] animate-pulse"></span>
              <span className="text-[var(--color-brand-aqua)] text-xs font-semibold tracking-wide uppercase">Tersedia Stok Baru Minggu Ini</span>
            </div>

            <h1 className="font-outfit text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              Bawa Harmoni Air ke <span className="text-gradient">Dalam Ruangan Anda.</span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              Spesialis koleksi Cupang, Koi, dan Arwana dengan genetik kontes. Dipilih langsung oleh expert untuk mempercantik ekosistem buatan di rumah Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/ikan" className="group relative px-8 py-4 bg-[var(--color-brand-aqua)] hover:bg-[#1bb888] text-white font-bold rounded-2xl shadow-glow transition-all flex items-center justify-center gap-3 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Jelajahi Koleksi <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block h-[500px]">
            {/* Main Featured Floating Image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent z-10 bottom-0 top-1/2 rounded-3xl"></div>
            <img
              src="https://dgocoeiqmqnkmwphorzy.supabase.co/storage/v1/object/public/gallery/1776021573392-ifcp0j.jpg"
              alt="Premium Fish"
              className="w-full h-full object-cover rounded-3xl animate-[float_6s_ease-in-out_infinite] shadow-2xl border border-white/10"
              style={{ objectPosition: 'center 30%' }}
            />
            {/* Floating Badge 1 */}
            <div className="absolute top-10 -left-10 glass-panel-dark px-4 py-3 rounded-2xl flex items-center gap-3 z-20 animate-[float_4s_ease-in-out_infinite_reverse]">
              <div className="bg-yellow-500/20 p-2 rounded-full"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /></div>
              <div>
                <p className="text-white font-bold text-sm">Grade Kontes</p>
                <p className="text-slate-400 text-xs">Genetik Terjamin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-panel bg-white p-8 md:p-10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center border border-slate-100 hover:shadow-bento-hover transition-all">
            <div className="w-20 h-20 bg-blue-50 text-[var(--color-brand-aqua)] flex flex-shrink-0 items-center justify-center rounded-3xl rotate-3">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-outfit text-2xl font-bold text-[var(--color-brand-navy)] mb-3">Garansi Ikan Hidup 100%</h3>
              <p className="text-slate-600 leading-relaxed">
                Klaim uang kembali penuh tanpa ribet jika ikan mengalami Death on Arrival (DOA) saat pengiriman. Keamanan berbelanja Anda adalah prioritas utama kami.
              </p>
            </div>
          </div>

          <div className="glass-panel bg-white p-8 md:p-10 rounded-[2rem] flex flex-col gap-6 border border-slate-100 hover:shadow-bento-hover transition-all">
            <div className="w-16 h-16 bg-blue-50 text-[var(--color-brand-aqua)] flex items-center justify-center rounded-2xl -rotate-3">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-bold text-[var(--color-brand-navy)] mb-2">Packing Ekstrem</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Oksigen full pressure dan insulasi suhu ganda untuk ketahanan hingga 5 hari perjalanan.</p>
            </div>
          </div>

          <div className="glass-panel bg-gradient-to-br from-[var(--color-brand-navy)] to-blue-900 p-8 md:p-10 rounded-[2rem] flex flex-col justify-end min-h-[300px] border border-transparent shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-white/5 group-hover:scale-110 transition-transform duration-500">
              <Droplet className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h3 className="font-outfit text-2xl font-bold text-white mb-2">Karantina Profesional</h3>
              <p className="text-blue-100/80 leading-relaxed text-sm">Setiap ikan telah melewati minimal 14 hari karantina bebas penyakit sebelum dikirim.</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[2rem] overflow-hidden relative group h-[300px]">
            <img src="https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&q=80" alt="Arwana" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-navy)]/90 via-transparent to-transparent flex flex-col justify-end p-8 md:p-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider w-max mb-3">High-End Collection</span>
              <h3 className="font-outfit text-2xl md:text-3xl font-bold text-white">Eksklusif Arwana Premium</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products with Dark Showcase Concept */}
      <section className="py-24 bg-[#050810] rounded-[3rem] lg:mx-4 mb-24 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-brand-aqua)] opacity-10 blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="font-outfit text-4xl font-bold text-white mb-4">Etalase Premium</h2>
              <p className="text-slate-400 text-lg">Warna alami yang memukau. Kualitas genetik yang telah dikurasi ketat.</p>
            </div>
            <Link href="/ikan" className="group text-[var(--color-brand-aqua)] font-semibold flex items-center gap-2 hover:text-white transition-colors">
              Lihat Seluruh Koleksi <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFish.map((fish: any) => (
              <ProductCard key={fish.id} product={fish} />
            ))}
            {popularFish.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400">
                Koneksi Supabase belum terisi data atau sedang diatur.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
