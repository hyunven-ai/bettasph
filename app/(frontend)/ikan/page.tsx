"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { FishProduct } from "@/components/ProductCard";
import { Sparkles, Filter, Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { ProductSkeleton } from "@/components/Skeleton";
import FishFilterPanel, { FishFilters, DEFAULT_FILTERS } from "@/components/FishFilterPanel";

type Category = { id: string; name: string; slug: string; color: string };

// Extended fish type with new filter columns
interface FishItem extends FishProduct {
  grade?: string;
  purpose?: string;
  color?: string;
  gender?: string;
  certified?: boolean;
  health_status?: string;
  badge?: string;
  featured?: boolean;
  description?: string;
}

// Badge style map
const BADGE_STYLES: Record<string, string> = {
  "Featured":        "bg-amber-500/20 border-amber-500/30 text-amber-300",
  "Best Seller":     "bg-orange-500/20 border-orange-500/30 text-orange-300",
  "Genetik Unggul":  "bg-blue-500/20 border-blue-500/30 text-blue-300",
  "Juara Kontes":    "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  "Rare / Limited":  "bg-purple-500/20 border-purple-500/30 text-purple-300",
};
const BADGE_ICONS: Record<string, string> = {
  "Featured": "⭐", "Best Seller": "🔥", "Genetik Unggul": "🧬",
  "Juara Kontes": "🏆", "Rare / Limited": "💎",
};

// Parse size string like "15cm" → number 15
function parseSizeCm(size: string): number {
  const match = size?.replace(/\s/g, "").match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Price filter
function inPriceRange(price: number, range: string): boolean {
  if (range === "<500")     return price < 500_000;
  if (range === "500-2jt")  return price >= 500_000  && price < 2_000_000;
  if (range === "2jt-10jt") return price >= 2_000_000 && price < 10_000_000;
  if (range === ">10jt")    return price >= 10_000_000;
  return true;
}

// Size filter
function inSizeRange(size: string, range: string): boolean {
  const cm = parseSizeCm(size);
  if (range === "5-10")  return cm >= 5  && cm <= 10;
  if (range === "10-20") return cm > 10  && cm <= 20;
  if (range === ">20")   return cm > 20;
  return true;
}

// Check if any advanced filter is active
function hasActiveAdvancedFilters(f: FishFilters): boolean {
  return (
    f.priceRange !== "all" ||
    f.grade !== "all" ||
    f.purpose !== "all" ||
    f.color !== "all" ||
    f.ukuranCm !== "all" ||
    f.gender !== "all" ||
    f.certified !== null ||
    f.healthStatus !== "all" ||
    f.badge !== "all"
  );
}

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("Semua Koleksi");
  const [allFish, setAllFish]       = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters]       = useState<FishFilters>(DEFAULT_FILTERS);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  // Load fish
  useEffect(() => {
    const fetchFish = async () => {
      const { data, error } = await supabase.from("fish_catalog").select("*");
      if (!error && data) {
        setAllFish(
          data.map((item) => ({
            ...item,
            imageUrl: item.image_url,
          }))
        );
      }
      setLoading(false);
    };
    fetchFish();
  }, []);

  // Filter logic (memoized for performance)
  const filteredFish = useMemo(() => {
    return allFish.filter((fish) => {
      // Category
      if (activeCategory !== "Semua Koleksi" && fish.category !== activeCategory) return false;

      // Search (name + description + category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${fish.name} ${fish.description ?? ""} ${fish.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Price
      if (!inPriceRange(fish.price, filters.priceRange)) return false;

      // Grade
      if (filters.grade !== "all" && fish.grade !== filters.grade) return false;

      // Purpose
      if (filters.purpose !== "all" && fish.purpose !== filters.purpose) return false;

      // Color
      if (filters.color !== "all" && fish.color !== filters.color) return false;

      // Size
      if (!inSizeRange(fish.size ?? "", filters.ukuranCm)) return false;

      // Gender
      if (filters.gender !== "all" && fish.gender !== filters.gender) return false;

      // Certified
      if (filters.certified !== null && fish.certified !== filters.certified) return false;

      // Health
      if (filters.healthStatus !== "all" && fish.health_status !== filters.healthStatus) return false;

      // Badge
      if (filters.badge !== "all" && fish.badge !== filters.badge) return false;

      return true;
    });
  }, [allFish, activeCategory, searchQuery, filters]);

  const filterTabs = ["Semua Koleksi", ...categories.map((c) => c.name)];
  const isAdvancedActive = hasActiveAdvancedFilters(filters);
  const totalActiveFilters = Object.values(filters).filter(
    (v) => v !== "all" && v !== null
  ).length + (searchQuery ? 1 : 0);

  const handleFilterChange = (key: keyof FishFilters, value: string | boolean | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActiveCategory("Semua Koleksi");
    setSearchQuery("");
  };

  return (
    <div className="bg-[#050810] min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 left-10 w-[400px] h-[400px] bg-[var(--color-brand-aqua)]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ─── Hero ───────────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-brand-aqua)]" />
              <span className="text-slate-300 text-sm font-medium">Ikanpedia.id Exclusive Gallery</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1 className="font-outfit text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Eksplorasi Mahakarya
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
              Setiap ikan di bawah ini memiliki sertifikasi genetik dan lolos uji kesehatan ketat. Pilih mahakarya air tawar Anda sekarang.
            </p>
          </FadeIn>
        </div>

        {/* ─── Search Bar ─────────────────────────────────────────────────── */}
        <FadeIn delay={0.35}>
          <div className="relative max-w-2xl mx-auto mb-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ikan, jenis, deskripsi..."
              className="w-full pl-14 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[var(--color-brand-aqua)]/50 focus:bg-white/8 transition-all backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </FadeIn>

        {/* ─── Jenis Filter Tabs ───────────────────────────────────────────── */}
        <FadeIn delay={0.4}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                    activeCategory === category
                      ? "bg-white text-[var(--color-brand-navy)] border-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Toggle Advanced Filter */}
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0 ${
                isAdvancedActive
                  ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter Lanjutan
              {isAdvancedActive && (
                <span className="ml-1 px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full">
                  {Object.values(filters).filter((v) => v !== "all" && v !== null).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
          </div>
        </FadeIn>

        {/* ─── Advanced Filter Panel ───────────────────────────────────────── */}
        {showAdvanced && (
          <FadeIn delay={0}>
            <div className="mb-8">
              <FishFilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onReset={resetAllFilters}
                hasActiveFilters={isAdvancedActive}
              />
            </div>
          </FadeIn>
        )}

        {/* ─── Results Counter ─────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="text-white font-semibold">{filteredFish.length}</span>{" "}
              dari{" "}
              <span className="text-white font-semibold">{allFish.length}</span>{" "}
              koleksi ikan
            </p>
            {(totalActiveFilters > 0) && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Reset semua filter
              </button>
            )}
          </div>
        )}

        {/* ─── Product Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            <>
              {filteredFish.map((fish, index) => (
                <FadeIn key={fish.id} delay={index * 0.04} direction="up" fullWidth>
                  <div className="relative h-full">
                    {/* Badge overlay */}
                    {fish.badge && BADGE_STYLES[fish.badge] && (
                      <div className={`absolute top-4 right-4 z-30 px-2.5 py-1 rounded-full border text-[10px] font-bold ${BADGE_STYLES[fish.badge]}`}>
                        {BADGE_ICONS[fish.badge]} {fish.badge}
                      </div>
                    )}
                    <ProductCard product={fish} />
                  </div>
                </FadeIn>
              ))}

              {filteredFish.length === 0 && (
                <div className="col-span-full text-center py-24 border border-white/5 rounded-3xl bg-white/[0.02]">
                  <div className="text-5xl mb-4">🐟</div>
                  <p className="text-slate-400 font-medium text-lg mb-2">
                    Tidak ada ikan yang sesuai
                  </p>
                  <p className="text-slate-600 text-sm mb-6">
                    Coba ubah filter atau kata kunci pencarian Anda
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Reset semua filter
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
