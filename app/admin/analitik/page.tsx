"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Fish,
  DollarSign,
  Package,
  ChevronRight,
  Star,
  BarChart2,
} from "lucide-react";

// ──────────────────────────────────────────────
// Tiny SVG horizontal bar chart
// ──────────────────────────────────────────────
function HorizontalBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// Tiny SVG donut
// ──────────────────────────────────────────────
function MiniDonut({ pct, color }: { pct: number; color: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const filled = (pct / 100) * c;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#1e2035" strokeWidth="6" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${filled} ${c - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="26" textAnchor="middle" fill="#e4e4e7" fontSize="9" fontWeight="700">
        {pct}%
      </text>
    </svg>
  );
}

export default function AdminAnalitikPage() {
  const [fishList, setFishList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("fish_catalog")
      .select("*")
      .then(({ data }) => {
        if (data) setFishList(data);
        setLoading(false);
      });
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);

  // Derived stats
  const totalIkan = fishList.length;
  const totalStok = fishList.reduce((s, f) => s + (f.stock || 0), 0);
  const totalNilai = fishList.reduce((s, f) => s + (f.price || 0), 0);
  const avgPrice = totalIkan > 0 ? totalNilai / totalIkan : 0;
  const habis = fishList.filter((f) => f.stock === 0).length;
  const tersedia = totalIkan - habis;

  // Category breakdown
  const categoryMap: Record<string, { count: number; totalStock: number; totalNilai: number }> = {};
  for (const f of fishList) {
    if (!categoryMap[f.category]) categoryMap[f.category] = { count: 0, totalStock: 0, totalNilai: 0 };
    categoryMap[f.category].count++;
    categoryMap[f.category].totalStock += f.stock || 0;
    categoryMap[f.category].totalNilai += f.price || 0;
  }
  const categories = Object.entries(categoryMap).sort((a, b) => b[1].count - a[1].count);
  const maxCatCount = Math.max(...categories.map(([, v]) => v.count), 1);

  // Top expensive fish
  const topFish = [...fishList].sort((a, b) => b.price - a.price).slice(0, 5);

  // Stok tersedia %
  const stokPct = totalIkan > 0 ? Math.round((tersedia / totalIkan) * 100) : 0;

  const catColors = ["#818cf8", "#34d399", "#f59e0b", "#f472b6", "#60a5fa"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">Analitik Koleksi</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Analitik Koleksi</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Ringkasan mendalam inventaris dan performa katalog ikan Anda.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Spesies", value: totalIkan, icon: Fish,
            color: "text-indigo-400", bg: "bg-indigo-500/15",
            sub: `${tersedia} tersedia`, trend: true,
          },
          {
            label: "Total Stok Ekor", value: `${totalStok}`, icon: Package,
            color: "text-emerald-400", bg: "bg-emerald-500/15",
            sub: `${habis} habis`, trend: habis === 0,
          },
          {
            label: "Total Nilai Katalog", value: formatPrice(totalNilai), icon: DollarSign,
            color: "text-amber-400", bg: "bg-amber-500/15",
            sub: "nilai koleksi", trend: true,
          },
          {
            label: "Rata-rata Harga", value: formatPrice(avgPrice), icon: BarChart2,
            color: "text-violet-400", bg: "bg-violet-500/15",
            sub: "per spesimen", trend: true,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#11121f] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-zinc-400 text-[11px] font-medium mb-1">{kpi.label}</p>
            {loading ? (
              <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
            ) : (
              <p className="text-xl font-bold text-zinc-100 tracking-tight truncate">{kpi.value}</p>
            )}
            <div className="flex items-center gap-1 mt-1.5">
              {kpi.trend ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-400" />
              )}
              <span className="text-[11px] text-zinc-600">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-300">Komposisi per Kategori</h2>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">Belum ada data kategori.</p>
          ) : (
            <div className="space-y-4">
              {categories.map(([cat, data], i) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: catColors[i % catColors.length] }}
                      />
                      <span className="text-[13px] font-medium text-zinc-300">{cat}</span>
                    </div>
                    <span className="text-[12px] text-zinc-500 font-mono">
                      {data.count} spesies · {data.totalStock} ekor
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HorizontalBar
                      value={data.count}
                      max={maxCatCount}
                      color={catColors[i % catColors.length]}
                    />
                    <span className="text-[11px] text-zinc-600 w-8 text-right">{Math.round((data.count / totalIkan) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stok Health */}
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-300">Kesehatan Stok</h2>
          </div>
          {loading ? (
            <div className="h-40 bg-zinc-800 rounded-xl animate-pulse" />
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-zinc-100">{stokPct}%</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Spesies Stok Tersedia</p>
                </div>
                <MiniDonut pct={stokPct} color="#818cf8" />
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Tersedia (stok > 0)", value: tersedia, color: "#34d399" },
                  { label: "Habis (stok = 0)", value: habis, color: "#f87171" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                    <span className="text-[12px] text-zinc-400 flex-1">{row.label}</span>
                    <span className="text-[12px] font-bold text-zinc-200">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.04]">
                <p className="text-[11px] text-zinc-600 mb-3">Kategori Nilai Tertinggi</p>
                {categories.slice(0, 3).map(([cat, data], i) => (
                  <div key={cat} className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-zinc-400">{cat}</span>
                    <span className="text-[12px] font-semibold text-zinc-200">{formatPrice(data.totalNilai)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Koleksi by Price */}
      <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <Star className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-300">Top 5 Koleksi Termahal</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {topFish.map((fish, i) => (
              <div key={fish.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-[11px] font-bold text-zinc-600 w-4">{i + 1}</span>
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  <img src={fish.image_url} alt={fish.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-200 truncate">{fish.name}</p>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                    {fish.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-zinc-100">{formatPrice(fish.price)}</p>
                  <p className="text-[11px] text-zinc-600">Stok: {fish.stock} ekor</p>
                </div>
                <div className="w-24">
                  <HorizontalBar value={fish.price} max={topFish[0]?.price || 1} color={catColors[i % catColors.length]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
