"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Fish,
  CheckCircle,
  XCircle,
  DollarSign,
  MessageSquare,
  BookOpen,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Package,
} from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";

// ------------------------------------------------------------------
// Tiny donut chart drawn with SVG (no external charting library needed)
// ------------------------------------------------------------------
function DonutChart({
  available,
  sold,
  total,
}: {
  available: number;
  sold: number;
  total: number;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const availableArc = total > 0 ? (available / total) * circ : 0;
  const soldArc = total > 0 ? (sold / total) * circ : 0;
  const emptyArc = circ - availableArc - soldArc;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <g transform="translate(55,55) rotate(-90)">
          {/* track */}
          <circle cx={0} cy={0} r={r} fill="none" stroke="#1e2035" strokeWidth={14} />
          {/* available — indigo */}
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="#818cf8"
            strokeWidth={14}
            strokeDasharray={`${availableArc} ${circ - availableArc}`}
            strokeLinecap="round"
          />
          {/* sold — violet */}
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={14}
            strokeDasharray={`${soldArc} ${circ - soldArc}`}
            strokeDashoffset={-availableArc}
            strokeLinecap="round"
          />
        </g>
        <text x="55" y="58" textAnchor="middle" fill="#e4e4e7" fontSize="18" fontWeight="700">
          {total}
        </text>
        <text x="55" y="72" textAnchor="middle" fill="#71717a" fontSize="10">
          total
        </text>
      </svg>
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          <span className="text-zinc-400">available: {available}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          <span className="text-zinc-400">sold: {sold}</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Stat card matching the reference screenshot
// ------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  dotColor,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  dotColor: string;
}) {
  return (
    <div className="relative bg-[#11121f] border border-white/[0.04] rounded-2xl p-6 overflow-hidden hover:border-[var(--color-brand-aqua)]/20 hover:scale-[1.02] transition-all duration-500 group">
      {/* top-left icon */}
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-6 border border-white/5`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {/* top-right colored dot */}
      <div
        className={`absolute top-4 right-4 w-10 h-10 rounded-full ${dotColor} opacity-20 blur-[6px] group-hover:opacity-40 transition-opacity`}
      />
      {/* value */}
      <p className="text-3xl font-black text-white tracking-tighter mb-1 font-outfit">{value}</p>
      <p className="text-[12px] text-zinc-500 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ------------------------------------------------------------------
// Mini bar chart (activity last 7 days) — SVG-based
// ------------------------------------------------------------------
function ActivityBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const barWidth = 18;
  const gap = 8;
  const chartH = 80;
  const totalW = data.length * (barWidth + gap) - gap;

  return (
    <svg width={totalW} height={chartH}>
      {data.map((val, i) => {
        const barH = Math.max(4, (val / max) * chartH);
        const x = i * (barWidth + gap);
        const y = chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={0} width={barWidth} height={chartH} rx={4} fill="#1e2035" />
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={val === Math.max(...data) ? "#6366f1" : "#312e81"}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ------------------------------------------------------------------
// Main Dashboard Page
// ------------------------------------------------------------------
export default function AdminDashboard() {
  const [fishList, setFishList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("fish_catalog")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setFishList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus "${name}" secara permanen?`)) return;
    setDeleteLoading(id);
    const { error } = await supabase.from("fish_catalog").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else fetchInventory();
    setDeleteLoading(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);

  // Derived stats
  const totalIkan = fishList.length;
  const tersedia = fishList.filter((f) => f.stock > 0).length;
  const terjual = fishList.filter((f) => f.stock === 0).length;
  const totalRevenue = fishList.reduce((acc, f) => acc + (f.price || 0), 0);
  const totalStok = fishList.reduce((acc, f) => acc + (f.stock || 0), 0);

  // Fake last-7-days activity (can plug in real data later)
  const activityData = [2, 5, 3, 8, 4, 6, totalIkan % 10];

  const statCards = [
    {
      label: "Total Koleksi",
      value: totalIkan,
      icon: Fish,
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/15",
      dotColor: "bg-violet-500",
    },
    {
      label: "Tersedia",
      value: tersedia,
      icon: CheckCircle,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      dotColor: "bg-emerald-500",
    },
    {
      label: "Habis",
      value: terjual,
      icon: XCircle,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/15",
      dotColor: "bg-rose-500",
    },
    {
      label: "Total Nilai Koleksi",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15",
      dotColor: "bg-amber-500",
    },
    {
      label: "Total Stok Ekor",
      value: `${totalStok} Ekor`,
      icon: Package,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/15",
      dotColor: "bg-sky-500",
    },
    {
      label: "Kategori Aktif",
      value: [...new Set(fishList.map((f) => f.category))].length,
      icon: BookOpen,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/15",
      dotColor: "bg-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn delay={0.1} direction="none">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter font-outfit">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Selamat datang kembali! Ini ikhtisar inventaris Anda.</p>
          </div>
          <Link
            href="/admin/tambah"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tambah Ikan
          </Link>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#11121f] border border-white/[0.04] rounded-2xl p-6 h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <FadeIn key={card.label} delay={0.1 + (index * 0.05)} fullWidth>
              <StatCard {...card} />
            </FadeIn>
          ))}
        </div>
      )}

      {/* Bottom Section: Activity Chart + Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity — Last 7 Days */}
        <FadeIn delay={0.4} direction="up" fullWidth>
          <div className="bg-[#11121f] border border-white/[0.04] rounded-2xl p-8 h-full">
            <div className="flex items-center gap-2 mb-8">
              <RefreshCw className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Aktivitas Inventaris</h2>
              <span className="ml-auto text-[10px] font-bold text-zinc-400 bg-white/5 px-3 py-1 rounded-full uppercase">7 Hari Terakhir</span>
            </div>
            {loading ? (
              <div className="h-[100px] flex items-center justify-center text-zinc-600 text-sm animate-pulse">
                Memuat basis data...
              </div>
            ) : fishList.length === 0 ? (
              <div className="h-[100px] flex items-center justify-center text-zinc-600 text-sm italic">
                Belum ada data aktivitas tercatat.
              </div>
            ) : (
              <div className="flex justify-center">
                <ActivityBars data={activityData} />
              </div>
            )}
          </div>
        </FadeIn>

        {/* Donut Chart — Fish by Status */}
        <FadeIn delay={0.5} direction="up" fullWidth>
          <div className="bg-[#11121f] border border-white/[0.04] rounded-2xl p-8 h-full">
            <div className="flex items-center gap-2 mb-8">
              <Fish className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Alokasi Koleksi</h2>
            </div>
            {loading ? (
              <div className="h-[140px] flex items-center justify-center text-zinc-600 text-sm animate-pulse">
                Menganalisis status...
              </div>
            ) : (
              <DonutChart available={tersedia} sold={terjual} total={totalIkan} />
            )}
          </div>
        </FadeIn>
      </div>

      {/* Recent Inventory Table */}
      <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-zinc-300">Inventaris Terbaru</h2>
          <Link
            href="/admin/koleksi"
            className="text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-zinc-400 whitespace-nowrap">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-zinc-600 border-b border-white/[0.04]">
                <th className="px-6 py-3 text-left font-semibold">Koleksi</th>
                <th className="px-6 py-3 text-left font-semibold">Kategori</th>
                <th className="px-6 py-3 text-left font-semibold">Harga</th>
                <th className="px-6 py-3 text-left font-semibold">Stok</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-5 h-5 border-2 border-indigo-800 border-t-indigo-400 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : fishList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-sm">
                    Belum ada data koleksi ikan.
                  </td>
                </tr>
              ) : (
                fishList.slice(0, 8).map((fish) => (
                  <tr key={fish.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-900 border border-white/[0.06] flex-shrink-0">
                        <img
                          src={fish.image_url}
                          alt={fish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-zinc-200">{fish.name}</p>
                        <p className="text-[11px] text-zinc-600 font-mono">Size: {fish.size}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                        {fish.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] font-medium text-zinc-200">
                      {formatPrice(fish.price)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[13px] font-semibold ${
                          fish.stock > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {fish.stock} Ekor
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fish.id, fish.name)}
                          disabled={deleteLoading === fish.id}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                          title="Hapus"
                        >
                          {deleteLoading === fish.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
