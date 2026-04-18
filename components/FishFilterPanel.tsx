"use client";

import { X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface FishFilters {
  priceRange: string;
  grade: string;
  purpose: string;
  color: string;
  ukuranCm: string;
  gender: string;
  certified: boolean | null;
  healthStatus: string;
  badge: string;
}

export const DEFAULT_FILTERS: FishFilters = {
  priceRange: "all",
  grade: "all",
  purpose: "all",
  color: "all",
  ukuranCm: "all",
  gender: "all",
  certified: null,
  healthStatus: "all",
  badge: "all",
};

interface FishFilterPanelProps {
  filters: FishFilters;
  onChange: (key: keyof FishFilters, value: string | boolean | null) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

// ─── Chip helper ─────────────────────────────────────────────────────────────
function FilterChips({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              active === opt.value
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FishFilterPanel({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
}: FishFilterPanelProps) {
  return (
    <div className="bg-[#0A0F1C] border border-white/8 rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-3 duration-200">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-200">Filter Lanjutan</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Reset Filter
          </button>
        )}
      </div>

      {/* Grid filter sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Harga */}
        <FilterChips
          label="Harga"
          active={filters.priceRange}
          onSelect={(v) => onChange("priceRange", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "<500", label: "< 500K" },
            { value: "500-2jt", label: "500K – 2JT" },
            { value: "2jt-10jt", label: "2JT – 10JT" },
            { value: ">10jt", label: "> 10JT" },
          ]}
        />

        {/* Grade */}
        <FilterChips
          label="Grade / Kualitas"
          active={filters.grade}
          onSelect={(v) => onChange("grade", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "Show Grade", label: "🏆 Show Grade" },
            { value: "Premium", label: "💎 Premium" },
            { value: "Standard", label: "Standard" },
          ]}
        />

        {/* Tujuan */}
        <FilterChips
          label="Tujuan Pemeliharaan"
          active={filters.purpose}
          onSelect={(v) => onChange("purpose", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "Pemula", label: "🌱 Pemula" },
            { value: "Kolektor", label: "🎯 Kolektor" },
            { value: "Kontes", label: "🏆 Kontes" },
            { value: "Breeding", label: "🧬 Breeding" },
          ]}
        />

        {/* Warna */}
        <FilterChips
          label="Warna Dominan"
          active={filters.color}
          onSelect={(v) => onChange("color", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "Merah", label: "🔴 Merah" },
            { value: "Putih", label: "⚪ Putih" },
            { value: "Hitam", label: "⚫ Hitam" },
            { value: "Mix / Pattern", label: "🌈 Mix / Pattern" },
          ]}
        />

        {/* Ukuran */}
        <FilterChips
          label="Ukuran"
          active={filters.ukuranCm}
          onSelect={(v) => onChange("ukuranCm", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "5-10", label: "5–10 cm" },
            { value: "10-20", label: "10–20 cm" },
            { value: ">20", label: "> 20 cm" },
          ]}
        />

        {/* Gender */}
        <FilterChips
          label="Gender"
          active={filters.gender}
          onSelect={(v) => onChange("gender", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "Jantan", label: "♂ Jantan" },
            { value: "Betina", label: "♀ Betina" },
          ]}
        />

        {/* Sertifikasi */}
        <FilterChips
          label="Sertifikasi"
          active={filters.certified === null ? "all" : String(filters.certified)}
          onSelect={(v) => {
            if (v === "all") onChange("certified", null);
            else onChange("certified", v === "true");
          }}
          options={[
            { value: "all", label: "Semua" },
            { value: "true", label: "✅ Bersertifikat" },
            { value: "false", label: "Non-sertifikat" },
          ]}
        />

        {/* Kesehatan */}
        <FilterChips
          label="Status Kesehatan"
          active={filters.healthStatus}
          onSelect={(v) => onChange("healthStatus", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "Siap Kirim", label: "🚀 Siap Kirim" },
            { value: "Karantina", label: "🧪 Karantina" },
          ]}
        />

        {/* Badge Eksklusif */}
        <FilterChips
          label="Badge Eksklusif"
          active={filters.badge}
          onSelect={(v) => onChange("badge", v)}
          options={[
            { value: "all", label: "Semua" },
            { value: "Featured", label: "⭐ Featured" },
            { value: "Best Seller", label: "🔥 Best Seller" },
            { value: "Genetik Unggul", label: "🧬 Genetik Unggul" },
            { value: "Juara Kontes", label: "🏆 Juara Kontes" },
            { value: "Rare / Limited", label: "💎 Rare / Limited" },
          ]}
        />
      </div>
    </div>
  );
}
