"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { FishProduct } from "@/components/ProductCard";
import { Sparkles, Filter } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { ProductSkeleton } from "@/components/Skeleton";

type Category = { id: string; name: string; slug: string; color: string };

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("Semua Koleksi");
  const [allFish, setAllFish] = useState<FishProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories dari API
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {/* silent */});
  }, []);

  // Load ikan dari Supabase
  useEffect(() => {
    const fetchFish = async () => {
      const { data, error } = await supabase
        .from('fish_catalog')
        .select('*');
      
      if (error) {
        console.error('Error fetching fish:', error);
      } else {
        const formattedData = data?.map(item => ({
          ...item,
          imageUrl: item.image_url
        })) || [];
        setAllFish(formattedData);
      }
      setLoading(false);
    };

    fetchFish();
  }, []);

  // Filter berdasarkan nama kategori (exact match)
  const filteredFish = allFish.filter(fish => {
    if (activeCategory === "Semua Koleksi") return true;
    return fish.category === activeCategory;
  });

  // Tab filter: "Semua Koleksi" + semua kategori dari DB
  const filterTabs = ["Semua Koleksi", ...categories.map((c) => c.name)];

  return (
    <div className="bg-[#050810] min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-40 left-10 w-[400px] h-[400px] bg-[var(--color-brand-aqua)]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-brand-aqua)]" />
              <span className="text-slate-300 text-sm font-medium">Bettasph Exclusive Gallery</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="font-outfit text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">Eksplorasi Mahakarya</h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
              Setiap ikan di bawah ini memiliki sertifikasi genetik dan lolos uji kesehatan ketat. Pilih mahakarya air tawar Anda sekarang.
            </p>
          </FadeIn>
        </div>

        {/* Filter Categories — Dinamis dari DB */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap justify-center gap-3">
            {filterTabs.map((category) => (
              <button 
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full border transition-all text-sm font-medium ${
                  activeCategory === category
                  ? "bg-white text-[var(--color-brand-navy)] border-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => alert("Fitur Filter Lanjutan (Harga, Ukuran, dll) akan tersedia pada update berikutnya!")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <Filter className="w-4 h-4" /> Filter Lanjutan
          </button>
        </div>

        {/* Grid Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
             Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
             ))
          ) : (
            <>
              {filteredFish.map((fish, index) => (
                 <FadeIn key={fish.id} delay={index * 0.05} direction="up" fullWidth>
                    <ProductCard product={fish} />
                 </FadeIn>
              ))}
              {filteredFish.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500 border border-white/5 rounded-3xl bg-white/5">
                  <p className="text-lg">
                    {activeCategory === "Semua Koleksi"
                      ? "Belum ada koleksi ikan di katalog."
                      : `Belum ada ikan dalam kategori "${activeCategory}".`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
