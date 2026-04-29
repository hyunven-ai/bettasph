"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface PriceSuggestion {
  has_history: boolean;
  suggested_start: number;
  suggested_increment: number;
  suggested_buy_now: number;
  confidence: "high" | "medium" | "low";
  based_on: number;
  stats?: {
    avg_winning: number;
    median_winning: number;
    min_winning: number;
    max_winning: number;
    avg_price_rise_pct: number;
  };
  trend?: { direction: "naik" | "turun" | "stabil"; percent: number };
  range: { min: number; max: number; label: string };
  message: string;
}

interface AutoPriceHintProps {
  category: string;
  grade?: string;
  sizeCm?: string;
  onApply: (start: number, increment: number, buyNow: number) => void;
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const CONFIDENCE_LABEL: Record<string, { label: string; color: string }> = {
  high: { label: "Akurasi Tinggi", color: "text-emerald-400" },
  medium: { label: "Akurasi Sedang", color: "text-amber-400" },
  low: { label: "Estimasi Kasar", color: "text-zinc-500" },
};

const TREND_ICON = {
  naik: TrendingUp,
  turun: TrendingDown,
  stabil: Minus,
};
const TREND_COLOR = { naik: "text-emerald-400", turun: "text-red-400", stabil: "text-zinc-500" };

export default function AutoPriceHint({ category, grade, sizeCm, onApply }: AutoPriceHintProps) {
  const [data, setData] = useState<PriceSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStats, setShowStats] = useState(false);

  const fetchSuggestion = async () => {
    if (!category) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ category });
      if (grade) params.set("grade", grade);
      if (sizeCm) params.set("size_cm", sizeCm);
      const res = await fetch(`/api/ai/price-suggestion?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Refetch saat category/grade/sizeCm berubah
  useEffect(() => {
    setData(null);
  }, [category, grade, sizeCm]);

  if (!category) return null;

  return (
    <div className="bg-[#0a1628] border border-violet-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-white">AI Auto Pricing</span>
          {data && (
            <span className={`text-[10px] font-medium ${CONFIDENCE_LABEL[data.confidence].color}`}>
              · {CONFIDENCE_LABEL[data.confidence].label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchSuggestion}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Analisis...</>
          ) : (
            <><Sparkles className="w-3 h-3" /> {data ? "Refresh" : "Analisis Harga"}</>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {!data && !loading && !error && (
          <p className="text-zinc-600 text-xs text-center py-2">
            Klik <strong className="text-zinc-400">Analisis Harga</strong> untuk melihat saran harga berdasarkan histori lelang.
          </p>
        )}

        {error && (
          <p className="text-red-400 text-xs text-center py-2">{error}</p>
        )}

        {data && (
          <div className="space-y-3">
            {/* Info message */}
            <p className="text-zinc-500 text-xs">{data.message}</p>

            {/* Suggested prices */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Harga Awal", value: data.suggested_start, key: "start" },
                { label: "Increment", value: data.suggested_increment, key: "inc" },
                { label: "Buy Now", value: data.suggested_buy_now, key: "buynow" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white font-bold text-xs">{formatRp(value)}</p>
                </div>
              ))}
            </div>

            {/* Trend indicator */}
            {data.trend && data.trend.direction !== "stabil" && (
              <div className={`flex items-center gap-1.5 text-xs ${TREND_COLOR[data.trend.direction]}`}>
                {(() => {
                  const Icon = TREND_ICON[data.trend!.direction];
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                Harga {data.trend.direction} {Math.abs(data.trend.percent)}% dibanding periode sebelumnya
              </div>
            )}

            {/* Range */}
            <div className="text-[10px] text-zinc-600">
              Range pasar: <span className="text-zinc-400">{data.range.label}</span>
            </div>

            {/* Tombol apply */}
            <button
              type="button"
              onClick={() => onApply(data.suggested_start, data.suggested_increment, data.suggested_buy_now)}
              className="w-full flex items-center justify-center gap-1.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-bold py-2 rounded-xl transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Terapkan Harga Ini
            </button>

            {/* Stats toggle */}
            {data.has_history && data.stats && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowStats((s) => !s)}
                  className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors w-full"
                >
                  {showStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showStats ? "Sembunyikan" : "Lihat"} statistik detail ({data.based_on} lelang)
                </button>
                {showStats && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
                    {[
                      { label: "Rata-rata menang", value: formatRp(data.stats.avg_winning) },
                      { label: "Median menang", value: formatRp(data.stats.median_winning) },
                      { label: "Terendah", value: formatRp(data.stats.min_winning) },
                      { label: "Tertinggi", value: formatRp(data.stats.max_winning) },
                      { label: "Rata-rata naik", value: `+${data.stats.avg_price_rise_pct}%` },
                      { label: "Basis data", value: `${data.based_on} lelang` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-zinc-600">
                        <span>{label}</span>
                        <span className="text-zinc-400 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
