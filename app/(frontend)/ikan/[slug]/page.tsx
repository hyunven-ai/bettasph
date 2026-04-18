"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShieldCheck, HelpCircle, Share2, Info } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Skeleton } from "@/components/Skeleton";
import MediaSlider from "@/components/MediaSlider";

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const addToCart = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('fish_catalog')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

      if (data) {
        setProduct({
          ...data,
          imageUrl: data.image_url,
          mediaUrls: data.media_urls ?? [],
        });
      } else {
        console.error('Error fetching product:', error);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [resolvedParams.slug]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);

  const discount = product?.discount_percent ?? 0;
  const hasDiscount = discount > 0;
  const finalPrice = product
    ? hasDiscount ? Math.round(product.price * (1 - discount / 100)) : product.price
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      imageUrl: product.imageUrl,
    });
    alert(`${product.name} telah diamankan ke Keranjang Anda.`);
  };

  return (
    <div className="bg-[#050810] min-h-screen pt-28 pb-20 relative">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--color-brand-aqua)]/10 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn delay={0.1} direction="none">
          <Link href="/ikan" className="inline-flex items-center text-slate-400 hover:text-white mb-10 transition-colors group text-sm uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Galeri
          </Link>
        </FadeIn>
        
        {loading ? (
           <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
             <Skeleton className="aspect-[4/5] rounded-[3rem]" />
             <div className="space-y-8 py-10">
               <Skeleton className="h-10 w-40 rounded-full" />
               <Skeleton className="h-20 w-full" />
               <Skeleton className="h-32 w-full" />
               <div className="grid grid-cols-2 gap-6">
                 <Skeleton className="h-24 rounded-2xl" />
                 <Skeleton className="h-24 rounded-2xl" />
               </div>
               <Skeleton className="h-16 w-full rounded-2xl" />
             </div>
           </div>
        ) : !product ? (
           <div className="text-center text-slate-400 py-20">
             <h2 className="text-2xl font-outfit mb-4 text-white">Ikan Tidak Ditemukan</h2>
             <p>Mohon maaf, ikan yang Anda cari mungkin sudah terjual atau tidak ada dalam katalog.</p>
           </div>
        ) : (

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
          {/* ── Media Slider ── */}
          <FadeIn delay={0.2} direction="right">
            <div className="sticky top-28">
              <MediaSlider
                mediaUrls={product.mediaUrls}
                productName={product.name}
                fallbackUrl={product.imageUrl}
              />
            </div>
          </FadeIn>

          {/* Product Info */}
          <div className="flex flex-col space-y-2">
            <FadeIn delay={0.3}>
              <div className="flex items-center gap-3 mb-6">
                 <span className="px-4 py-1.5 bg-[var(--color-brand-aqua)]/10 border border-[var(--color-brand-aqua)]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand-aqua)]">
                    Premium Edition
                 </span>
                 <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"><Info className="w-4 h-4 text-slate-600" /> Genetik Tersertifikasi</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <h1 className="font-outfit text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
                {product.name}
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.5}>
              <div className="mb-10 pb-10 border-b border-white/5">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-3">Nilai Investasi</p>
                {hasDiscount ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl lg:text-7xl font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-500 tracking-tighter">
                        {formatPrice(finalPrice)}
                      </div>
                      <span className="self-start mt-2 px-3 py-1.5 bg-rose-500 text-white text-sm font-black rounded-full shadow-lg">
                        -{discount}%
                      </span>
                    </div>
                    <p className="text-slate-600 text-xl font-medium line-through">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                ) : (
                  <div className="text-5xl lg:text-7xl font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-500 tracking-tighter">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="grid grid-cols-2 gap-6 mb-10">
                 <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Ukuran (Size)</p>
                    <p className="text-white font-bold text-xl font-outfit">{product.size}</p>
                 </div>
                 <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Karakteristik</p>
                    <p className="text-white font-bold text-xl font-outfit">
                       {product.characteristic || "—"}
                    </p>
                 </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.7}>
              <div className="mb-12">
                <h3 className="text-slate-300 font-bold mb-4 text-[13px] uppercase tracking-widest opacity-60">Deskripsi Kurator</h3>
                <p className="text-slate-400 leading-relaxed font-medium text-lg lg:text-xl">
                  {product.description}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.8} direction="none">
              <div className="flex flex-col gap-6 mt-4">
                <button 
                  onClick={handleAddToCart}
                  className="w-full py-6 bg-white text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-aqua)] hover:text-white font-black rounded-2xl flex justify-center items-center gap-4 transition-all duration-500 ease-senior text-xl shadow-2xl hover:scale-[1.02] active:scale-95"
                >
                  Amankan Sekarang <ShoppingBag className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--color-brand-aqua)]" /> Garansi D.O.A 100%</span>
                  <Link href="/kebijakan-garansi" className="flex items-center gap-2 hover:text-white transition-colors"><HelpCircle className="w-4 h-4" /> Butuh Bantuan?</Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
