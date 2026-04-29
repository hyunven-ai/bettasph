"use client";

import { useState, useCallback } from "react";
import {
  Sparkles, X, ChevronRight, Loader2, Fish, Gavel,
  TrendingUp, AlertCircle, Star, DollarSign, Beaker
} from "lucide-react";

interface Recommendation {
  rank: number;
  name: string;
  species: string;
  category: string;
  price_range: { min: number; max: number; label: string };
  difficulty: string;
  investment_value: string;
  match_score: number;
  reasons: string[];
  care_notes: string;
  characteristics: string[];
}

interface ApiResponse {
  recommendations: Recommendation[];
  tip: string;
  total_analyzed: number;
}

type Step = "intro" | "budget" | "experience" | "purpose" | "tank" | "prefs" | "result";
type FormState = { budget: number; experience: string; purpose: string; tankSize: number; prefs: string[] };

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const PREFS_OPTIONS = [
  "warna cerah", "warna merah", "warna biru", "mudah dirawat",
  "komunal", "predator", "breeding", "aquascape", "panjang umur", "rare",
];

const DIFFICULTY_COLOR: Record<string, string> = {
  pemula: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  menengah: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  expert: "text-red-400 bg-red-500/10 border-red-500/30",
};

const INVESTMENT_ICON: Record<string, string> = {
  rendah: "⬜",
  sedang: "🟡",
  tinggi: "🟢",
};

export default function AiRecommendModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [form, setForm] = useState<FormState>({
    budget: 500000,
    experience: "pemula",
    purpose: "hobi",
    tankSize: 60,
    prefs: [],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("intro");
    setResult(null);
    setError("");
    setForm({ budget: 500000, experience: "pemula", purpose: "hobi", tankSize: 60, prefs: [] });
  };

  const handleClose = () => { setOpen(false); reset(); };

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: form.budget,
          experience: form.experience,
          purpose: form.purpose,
          tank_size: form.tankSize,
          preferences: form.prefs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapat rekomendasi.");
      setResult(data);
      setStep("result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const togglePref = (p: string) => {
    setForm((prev) => ({
      ...prev,
      prefs: prev.prefs.includes(p) ? prev.prefs.filter((x) => x !== p) : [...prev.prefs, p],
    }));
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
      >
        <Sparkles className="w-4 h-4" />
        Cari Ikan dengan AI
      </button>

      {/* Modal Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="relative w-full max-w-lg bg-[#0d1526] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm">AI Rekomendasi Ikan</h2>
                  <p className="text-zinc-600 text-[10px]">Dianalisis dari {result?.total_analyzed || 10}+ jenis ikan</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            {step !== "result" && step !== "intro" && (
              <div className="h-0.5 bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${(["budget","experience","purpose","tank","prefs"].indexOf(step) + 1) * 20}%` }}
                />
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {/* INTRO */}
              {step === "intro" && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Fish className="w-8 h-8 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Bingung pilih ikan?</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      AI kami akan merekomendasikan ikan terbaik sesuai <strong className="text-zinc-200">budget</strong>, <strong className="text-zinc-200">pengalaman</strong>, dan <strong className="text-zinc-200">tujuanmu</strong> — hanya dalam 30 detik.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { icon: DollarSign, label: "Budget-aware", desc: "Sesuai kantong" },
                      { icon: Star, label: "Personalized", desc: "Dari 10+ jenis" },
                      { icon: TrendingUp, label: "Smart Tips", desc: "Tips perawatan" },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                        <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                        <p className="text-white text-xs font-semibold">{label}</p>
                        <p className="text-zinc-600 text-[10px]">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep("budget")}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Mulai <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* BUDGET */}
              {step === "budget" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Langkah 1 dari 5</p>
                    <h3 className="text-white font-bold text-base">Berapa budget kamu?</h3>
                    <p className="text-zinc-500 text-sm">Untuk 1 ekor ikan</p>
                  </div>
                  <div className="text-center py-3">
                    <p className="text-3xl font-black text-violet-400">{formatRupiah(form.budget)}</p>
                  </div>
                  <input
                    type="range"
                    min={20000} max={10000000} step={10000}
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: parseInt(e.target.value) }))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Rp 20K</span><span>Rp 1jt</span><span>Rp 10jt</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[100000, 500000, 1000000, 5000000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setForm((f) => ({ ...f, budget: v }))}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          form.budget === v ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "border-white/[0.08] text-zinc-500 hover:border-zinc-600"
                        }`}
                      >
                        {v >= 1000000 ? `${v/1000000}jt` : `${v/1000}k`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {step === "experience" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Langkah 2 dari 5</p>
                    <h3 className="text-white font-bold text-base">Pengalaman merawat ikan?</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { value: "pemula", label: "Pemula", desc: "Baru pertama kali atau < 1 tahun" },
                      { value: "menengah", label: "Menengah", desc: "1-3 tahun, sudah pernah breeding" },
                      { value: "expert", label: "Expert", desc: "3+ tahun, pernah ikut kontes" },
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setForm((f) => ({ ...f, experience: value }))}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          form.experience === value
                            ? "bg-violet-500/15 border-violet-500/40"
                            : "border-white/[0.08] hover:border-zinc-700"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.experience === value ? "border-violet-500 bg-violet-500" : "border-zinc-600"
                        }`} />
                        <div>
                          <p className="text-white font-semibold text-sm">{label}</p>
                          <p className="text-zinc-500 text-xs">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PURPOSE */}
              {step === "purpose" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Langkah 3 dari 5</p>
                    <h3 className="text-white font-bold text-base">Tujuan memelihara ikan?</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { value: "hobi", label: "🐠 Hobi / Hiasan", desc: "Menikmati keindahan dan merawat ikan" },
                      { value: "kontes", label: "🏆 Kontes / Lomba", desc: "Ikut kompetisi ikan hias" },
                      { value: "investasi", label: "💰 Investasi", desc: "Breeding dan jual kembali" },
                      { value: "breeding", label: "🥚 Breeding", desc: "Fokus pada perkembangbiakan" },
                      { value: "aquascape", label: "🌿 Aquascape", desc: "Dekorasi aquarium tematik" },
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setForm((f) => ({ ...f, purpose: value }))}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          form.purpose === value
                            ? "bg-violet-500/15 border-violet-500/40"
                            : "border-white/[0.08] hover:border-zinc-700"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.purpose === value ? "border-violet-500 bg-violet-500" : "border-zinc-600"
                        }`} />
                        <div>
                          <p className="text-white font-semibold text-sm">{label}</p>
                          <p className="text-zinc-500 text-xs">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TANK SIZE */}
              {step === "tank" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Langkah 4 dari 5</p>
                    <h3 className="text-white font-bold text-base">Ukuran aquarium / kolam?</h3>
                    <p className="text-zinc-500 text-sm">Panjang terpanjang</p>
                  </div>
                  <div className="text-center py-3">
                    <p className="text-3xl font-black text-violet-400">{form.tankSize} <span className="text-lg text-zinc-500">cm</span></p>
                  </div>
                  <input
                    type="range" min={15} max={300} step={5}
                    value={form.tankSize}
                    onChange={(e) => setForm((f) => ({ ...f, tankSize: parseInt(e.target.value) }))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>15cm (nano)</span><span>150cm</span><span>300cm (kolam)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 100, 200].map((v) => (
                      <button
                        key={v}
                        onClick={() => setForm((f) => ({ ...f, tankSize: v }))}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          form.tankSize === v ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "border-white/[0.08] text-zinc-500 hover:border-zinc-600"
                        }`}
                      >
                        {v}cm
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PREFERENCES */}
              {step === "prefs" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Langkah 5 dari 5</p>
                    <h3 className="text-white font-bold text-base">Preferensi ikan? <span className="text-zinc-600 font-normal">(opsional)</span></h3>
                    <p className="text-zinc-500 text-sm">Pilih sebanyak yang kamu mau</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PREFS_OPTIONS.map((p) => {
                      const selected = form.prefs.includes(p);
                      return (
                        <button
                          key={p}
                          onClick={() => togglePref(p)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                              : "border-white/[0.08] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                          }`}
                        >
                          {selected ? "✓ " : ""}{p}
                        </button>
                      );
                    })}
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* RESULTS */}
              {step === "result" && result && (
                <div className="space-y-4">
                  {/* Tip */}
                  {result.tip && (
                    <div className="flex items-start gap-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                      <p className="text-violet-300 text-xs leading-relaxed">{result.tip}</p>
                    </div>
                  )}

                  {result.recommendations.length === 0 ? (
                    <div className="text-center py-8">
                      <Fish className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">Tidak ada rekomendasi yang cocok.</p>
                      <p className="text-zinc-700 text-sm mt-1">Coba perbesar budget atau ubah kriteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.recommendations.map((rec) => (
                        <div
                          key={rec.name}
                          className={`rounded-xl border overflow-hidden ${
                            rec.rank === 1
                              ? "border-violet-500/30 bg-violet-500/[0.06]"
                              : "border-white/[0.06] bg-white/[0.02]"
                          }`}
                        >
                          <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  {rec.rank === 1 && (
                                    <span className="text-[9px] bg-violet-500 text-white px-1.5 py-0.5 rounded font-bold">
                                      TERBAIK
                                    </span>
                                  )}
                                  <h4 className="text-white font-bold text-sm">{rec.name}</h4>
                                </div>
                                <p className="text-zinc-500 text-xs italic">{rec.species}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-violet-400 font-bold text-xs">{rec.price_range.label}</p>
                                <div className="flex items-center gap-1 justify-end mt-0.5">
                                  <span className={`text-[9px] border px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLOR[rec.difficulty]}`}>
                                    {rec.difficulty}
                                  </span>
                                  <span className="text-[10px]" title={`Investasi ${rec.investment_value}`}>
                                    {INVESTMENT_ICON[rec.investment_value]}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Reasons */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {rec.reasons.slice(0, 3).map((r) => (
                                <span key={r} className="text-[9px] bg-white/[0.04] border border-white/[0.08] text-zinc-400 px-2 py-0.5 rounded-full">
                                  {r}
                                </span>
                              ))}
                            </div>

                            {/* Care note */}
                            <p className="text-zinc-600 text-[10px] leading-relaxed">{rec.care_notes}</p>
                          </div>

                          {/* CTA */}
                          <div className="px-4 pb-3">
                            <a
                              href={`/lelang?category=${rec.category}`}
                              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                            >
                              <Gavel className="w-3 h-3" />
                              Lihat lelang {rec.category} →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 py-2 transition-colors"
                  >
                    ↩ Mulai ulang
                  </button>
                </div>
              )}
            </div>

            {/* Footer Nav */}
            {step !== "intro" && step !== "result" && (
              <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    const steps: Step[] = ["intro", "budget", "experience", "purpose", "tank", "prefs"];
                    const i = steps.indexOf(step);
                    if (i > 0) setStep(steps[i - 1]);
                  }}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-300 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-semibold transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  onClick={() => {
                    const steps: Step[] = ["budget", "experience", "purpose", "tank", "prefs"];
                    const i = steps.indexOf(step);
                    if (i < steps.length - 1) {
                      setStep(steps[i + 1]);
                    } else {
                      fetchRecommendations();
                    }
                  }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-2 rounded-xl text-sm transition-all"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...</>
                  ) : step === "prefs" ? (
                    <><Sparkles className="w-4 h-4" /> Tampilkan Rekomendasi</>
                  ) : (
                    <>Lanjut <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
