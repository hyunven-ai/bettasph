"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShieldCheck, HelpCircle, Share2, Info } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

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
          imageUrl: data.image_url // Mapping snake_case from DB
        });
      } else {
        console.error('Error fetching product:', error);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [resolvedParams.slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    alert(`${product.name} telah diamankan ke Keranjang Anda.`);
  };

  return (
    <div className="bg-[#050810] min-h-screen pt-28 pb-20 relative">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--color-brand-aqua)]/10 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href="/ikan" className="inline-flex items-center text-slate-400 hover:text-white mb-10 transition-colors group text-sm uppercase tracking-widest font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Galeri
        </Link>
        
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="w-12 h-12 border-4 border-slate-700 border-t-[var(--color-brand-aqua)] rounded-full animate-spin"></div>
           </div>
        ) : !product ? (
           <div className="text-center text-slate-400 py-20">
             <h2 className="text-2xl font-outfit mb-4 text-white">Ikan Tidak Ditemukan</h2>
             <p>Mohon maaf, ikan yang Anda cari mungkin sudah terjual atau tidak ada dalam katalog.</p>
           </div>
        ) : (

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
          {/* Image Showcase */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent z-10"></div>
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#0A0F1C] border border-white/5 relative">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {/* Overlay elements */}
              <div className="absolute top-6 right-6 z-20 flex gap-3">
                 <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white hover:text-black transition-colors">
                   <Share2 className="w-4 h-4" />
                 </button>
              </div>
              <div className="absolute bottom-10 left-10 z-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-sm font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Sisa {product.stock} ekor di Farm
                </div>
              </div>
            </div>
            {/* Ambient shadow behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--color-brand-aqua)]/20 blur-[100px] -z-10 rounded-full"></div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">
                  Premium Edition
               </span>
               <span className="text-slate-500 text-sm flex items-center gap-1"><Info className="w-4 h-4" /> Genetik Tersertifikasi</span>
            </div>
            
            <h1 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="mb-10 pb-10 border-b border-white/10">
               <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Nilai Investasi</p>
               <div className="text-4xl lg:text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {formatPrice(product.price)}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ukuran (Size)</p>
                  <p className="text-white font-medium text-lg">{product.size}</p>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Karakteristik</p>
                  <p className="text-white font-medium text-lg">Agresif / Alpha</p>
               </div>
            </div>

            <div className="mb-10">
              <h3 className="text-slate-300 font-medium mb-4 text-lg">Deskripsi Kurator</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                className="w-full py-5 bg-white text-[var(--color-brand-navy)] hover:bg-slate-200 font-bold rounded-2xl flex justify-center items-center gap-3 transition-colors text-lg"
              >
                Tambahkan ke Keranjang <ShoppingBag className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-between px-2 mt-4 text-sm text-slate-400">
                <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--color-brand-aqua)]" /> Garansi D.O.A 100%</span>
                <Link href="#" className="flex items-center gap-2 hover:text-white transition-colors"><HelpCircle className="w-4 h-4" /> Butuh Bantuan?</Link>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
