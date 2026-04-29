import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AuctionCard from "@/components/AuctionCard";
import AiRecommendModal from "@/components/AiRecommendModal";
import { Gavel, Flame, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Lelang Ikan Live",
  description: "Ikuti lelang ikan hias premium secara real-time. Betta, Koi, Arwana, dan banyak lagi di ikanpedia.id",
};

export const revalidate = 30; // ISR: refresh tiap 30 detik

const CATEGORIES = [
  { value: "all", label: "Semua" },
  { value: "betta", label: "Betta" },
  { value: "koi", label: "Koi" },
  { value: "arwana", label: "Arwana" },
  { value: "guppy", label: "Guppy" },
  { value: "other", label: "Lainnya" },
];

interface PageProps {
  searchParams: Promise<{ category?: string; tab?: string }>;
}

export default async function LelangPage({ searchParams }: PageProps) {
  const { category, tab = "active" } = await searchParams;

  // Query berdasarkan tab
  const statuses: Record<string, string[]> = {
    active: ["active"],
    scheduled: ["scheduled"],
    ended: ["ended"],
  };
  const statusFilter = statuses[tab] || ["active"];

  let query = supabaseAdmin
    .from("auctions")
    .select("*")
    .in("status", statusFilter)
    .order("is_featured", { ascending: false })
    .order("ends_at", { ascending: true })
    .limit(24);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data: rawAuctions } = await query;
  const auctions = rawAuctions ?? [];

  // Featured (hanya di tab active)
  const featured = tab === "active"
    ? auctions.filter((a: any) => a.is_featured)
    : [];
  const regular = tab === "active"
    ? auctions.filter((a: any) => !a.is_featured)
    : auctions;

  return (
    <div className="min-h-screen bg-[#050810]">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2540] via-[#0B1120] to-[#050810] border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {auctions.filter((a: any) => a.status === "active").length || 0} Lelang Aktif
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            Lelang Ikan{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Premium
            </span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl">
            Bid langsung, menangkan ikan impianmu. Lelang live betta, koi, arwana, dan ikan hias pilihan dari breeder terpercaya.
          </p>
          <div className="mt-6">
            <AiRecommendModal />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigasi */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-6 w-fit">
          {[
            { value: "active", label: "Live", icon: Flame },
            { value: "scheduled", label: "Akan Datang", icon: Clock },
            { value: "ended", label: "Selesai", icon: Gavel },
          ].map(({ value, label, icon: Icon }) => {
            const isActive = tab === value;
            return (
              <a
                key={value}
                href={`/lelang?tab=${value}${category ? `&category=${category}` : ""}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </a>
            );
          })}
        </div>

        {/* Filter Kategori */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(({ value, label }) => {
            const isSelected = (!category && value === "all") || category === value;
            return (
              <a
                key={value}
                href={`/lelang?tab=${tab}&category=${value}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "border-white/[0.08] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Featured Section */}
        {featured.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Featured</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {(featured as any[]).map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Grid */}
        {regular.length > 0 ? (
          <section>
            {featured.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Semua Lelang</h2>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {(regular as any[]).map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </section>
        ) : (
          auctions.length === 0 && (
            <div className="text-center py-24">
              <Gavel className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg font-semibold">
                {tab === "active" ? "Belum ada lelang aktif" : tab === "scheduled" ? "Belum ada lelang terjadwal" : "Belum ada riwayat lelang"}
              </p>
              <p className="text-zinc-700 text-sm mt-1">Coba kategori lain atau cek kembali nanti</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
