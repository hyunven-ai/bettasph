"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fish, Gavel, Calendar, Image as ImageIcon,
  ChevronLeft, Loader2, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import AutoPriceHint from "@/components/AutoPriceHint";

const CATEGORIES = ["betta", "koi", "arwana", "guppy", "other"];
const GRADES = ["S+", "S", "A", "B", "C"];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function TambahLelangPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fish_name: "",
    species: "",
    category: "betta",
    grade: "",
    size_cm: "",
    description: "",
    image_urls: [] as string[],  // Array langsung dari ImageUploader
    video_url: "",
    start_price: "",
    bid_increment: "10000",
    buy_now_price: "",
    starts_at: "",
    ends_at: "",
    seller_name: "Admin Ikanpedia",
    seller_wa: "",
    is_featured: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    const payload = {
      ...form,
      image_urls: form.image_urls,  // sudah array dari ImageUploader
      start_price: parseInt(form.start_price),
      bid_increment: parseInt(form.bid_increment),
      buy_now_price: form.buy_now_price ? parseInt(form.buy_now_price) : null,
      size_cm: form.size_cm ? parseFloat(form.size_cm) : null,
      grade: form.grade || null,
      species: form.species || null,
      video_url: form.video_url || null,
      seller_wa: form.seller_wa || null,
    };

    const res = await fetch("/api/auctions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error || "Gagal membuat lelang.");
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/admin/lelang"), 1500);
  };

  const minBid = form.start_price ? parseInt(form.start_price) + parseInt(form.bid_increment || "0") : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Buat Lelang Baru</h1>
          <p className="text-zinc-500 text-sm">Isi detail ikan dan konfigurasi lelang</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ---- SEKSI: INFO IKAN ---- */}
        <Section icon={Fish} title="Informasi Ikan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Ikan *" required>
              <input
                type="text"
                value={form.fish_name}
                onChange={(e) => set("fish_name", e.target.value)}
                placeholder="cth. Betta Galaxy Halfmoon"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Nama Ilmiah">
              <input
                type="text"
                value={form.species}
                onChange={(e) => set("species", e.target.value)}
                placeholder="cth. Betta splendens"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Kategori *">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0f172a] capitalize">{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Grade">
              <select
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
                className={inputCls}
              >
                <option value="" className="bg-[#0f172a]">— Pilih —</option>
                {GRADES.map((g) => (
                  <option key={g} value={g} className="bg-[#0f172a]">{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Ukuran (cm)">
              <input
                type="number"
                value={form.size_cm}
                onChange={(e) => set("size_cm", e.target.value)}
                placeholder="cth. 6.5"
                step="0.5"
                min="1"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Deskripsi">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Deskripsikan kondisi ikan, keunikan, cara perawatan, dll..."
              rows={4}
              className={inputCls + " resize-none"}
            />
          </Field>
        </Section>

        {/* ---- SEKSI: MEDIA ---- */}
        <Section icon={ImageIcon} title="Foto & Video">
          <Field label="Upload Foto Ikan" hint="Foto pertama otomatis jadi cover. Maks 6 foto, 5MB per file.">
            <ImageUploader
              value={form.image_urls}
              onChange={(urls) => set("image_urls", urls)}
              folder="auctions"
              maxFiles={6}
            />
          </Field>
          <Field label="URL Video (opsional)" hint="YouTube, TikTok, atau direct MP4">
            <input
              type="url"
              value={form.video_url}
              onChange={(e) => set("video_url", e.target.value)}
              placeholder="https://youtube.com/..."
              className={inputCls}
            />
          </Field>
        </Section>

        {/* ---- SEKSI: HARGA & BIDDING ---- */}
        <Section icon={Gavel} title="Konfigurasi Harga & Bid">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Harga Awal (Rp) *" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
                <input
                  type="number"
                  value={form.start_price}
                  onChange={(e) => set("start_price", e.target.value)}
                  placeholder="150000"
                  min="1000"
                  className={inputCls + " pl-9"}
                  required
                />
              </div>
            </Field>
            <Field label="Kelipatan Bid (Rp) *">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
                <input
                  type="number"
                  value={form.bid_increment}
                  onChange={(e) => set("bid_increment", e.target.value)}
                  min="1000"
                  step="1000"
                  className={inputCls + " pl-9"}
                  required
                />
              </div>
            </Field>
            <Field label="Harga Buy Now (Rp)" hint="Kosongkan jika tidak ada">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
                <input
                  type="number"
                  value={form.buy_now_price}
                  onChange={(e) => set("buy_now_price", e.target.value)}
                  placeholder="Opsional"
                  min="1000"
                  className={inputCls + " pl-9"}
                />
              </div>
            </Field>
          </div>

          {minBid && (
            <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <p className="text-blue-300 text-xs">
                Bid pertama minimal: <strong>{formatRupiah(minBid)}</strong>
                {form.buy_now_price && parseInt(form.buy_now_price) > 0 && (
                  <> · Buy Now: <strong>{formatRupiah(parseInt(form.buy_now_price))}</strong></>
                )}
              </p>
            </div>
          )}

          {/* AI Auto Pricing Widget */}
          <AutoPriceHint
            category={form.category}
            grade={form.grade || undefined}
            sizeCm={form.size_cm || undefined}
            onApply={(start, inc, buyNow) => {
              setForm((prev) => ({
                ...prev,
                start_price: start.toString(),
                bid_increment: inc.toString(),
                buy_now_price: buyNow.toString(),
              }));
            }}
          />
        </Section>

        {/* ---- SEKSI: JADWAL ---- */}
        <Section icon={Calendar} title="Jadwal Lelang">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Mulai *" required>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => set("starts_at", e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Berakhir *" required>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => set("ends_at", e.target.value)}
                min={form.starts_at}
                className={inputCls}
                required
              />
            </Field>
          </div>
        </Section>

        {/* ---- SEKSI: SELLER ---- */}
        <Section icon={Fish} title="Info Seller">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Seller *">
              <input
                type="text"
                value={form.seller_name}
                onChange={(e) => set("seller_name", e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="WhatsApp Seller">
              <input
                type="tel"
                value={form.seller_wa}
                onChange={(e) => set("seller_wa", e.target.value)}
                placeholder="628xxxx"
                className={inputCls}
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div
              onClick={() => set("is_featured", !form.is_featured)}
              className={`w-10 h-5 rounded-full transition-colors ${form.is_featured ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Featured (tampil di atas)
            </span>
          </label>
        </Section>

        {/* ---- FEEDBACK ---- */}
        {status === "error" && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm px-4 py-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Lelang berhasil dibuat! Mengarahkan ke daftar lelang...
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-zinc-400 hover:text-zinc-200 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || status === "success"}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
            {submitting ? "Menyimpan..." : "Buat Lelang"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- Sub-components ----

const inputCls =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
        <Icon className="w-4 h-4 text-emerald-400" />
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
        {label}
        {required && <span className="text-emerald-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-zinc-700">{hint}</p>}
    </div>
  );
}
