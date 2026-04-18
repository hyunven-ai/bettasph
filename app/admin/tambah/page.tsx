"use client";

import { useState, useEffect } from "react";
import { Fish, CheckCircle2, ArrowLeft, Loader2, AlertCircle, Plus, Trash2, Play, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function isVideo(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

type Category = { id: string; name: string; slug: string; color: string };

const GRADE_OPTIONS    = ["Standard", "Premium", "Show Grade"];
const PURPOSE_OPTIONS  = ["Pemula", "Kolektor", "Kontes", "Breeding"];
const COLOR_OPTIONS    = ["Merah", "Putih", "Hitam", "Mix / Pattern"];
const GENDER_OPTIONS   = ["Jantan", "Betina"];
const HEALTH_OPTIONS   = ["Siap Kirim", "Karantina"];
const BADGE_OPTIONS    = ["", "Featured", "Best Seller", "Genetik Unggul", "Juara Kontes", "Rare / Limited"];

function TambahKoleksiForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    size: "",
    image_url: "",
    stock: "1",
    description: "",
    // New filter fields
    grade: "Standard",
    purpose: "",
    color: "",
    gender: "",
    certified: false,
    health_status: "Siap Kirim",
    badge: "",
    featured: false,
    discount_percent: "0",
    characteristic: "",
  });

  // media_urls state — separate from formData for dynamic list management
  const [mediaUrls, setMediaUrls] = useState<string[]>([""]);  // start with one empty input

  const addMediaUrl = () => setMediaUrls((prev) => [...prev, ""]);
  const removeMediaUrl = (idx: number) => setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  const updateMediaUrl = (idx: number, val: string) =>
    setMediaUrls((prev) => prev.map((u, i) => (i === idx ? val : u)));

  useEffect(() => {
    setLoadingCategories(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setFormData((prev) => ({
            ...prev,
            category: prev.category || data[0].name,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!editId) return;
    setFetchingEdit(true);
    fetch(`/api/fish/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.name) {
          setFormData({
            name: data.name,
            category: data.category || "",
            price: String(data.price ?? ""),
            size: data.size || "",
            image_url: data.image_url || "",
            stock: String(data.stock ?? "1"),
            description: data.description || "",
            grade: data.grade || "Standard",
            purpose: data.purpose || "",
            color: data.color || "",
            gender: data.gender || "",
            certified: data.certified || false,
            health_status: data.health_status || "Siap Kirim",
            badge: data.badge || "",
            featured: data.featured || false,
            discount_percent: String(data.discount_percent ?? "0"),
            characteristic: data.characteristic || "",
          });
          // Load existing media_urls
          if (Array.isArray(data.media_urls) && data.media_urls.length > 0) {
            setMediaUrls(data.media_urls);
          } else if (data.image_url) {
            setMediaUrls([data.image_url]);
          }
        }
      })
      .catch(() => alert("Gagal memuat data untuk diedit."))
      .finally(() => setFetchingEdit(false));
  }, [editId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build cleaned media_urls (remove empty entries)
      const cleanedMedia = mediaUrls.filter((u) => u.trim() !== "");
      const payload = {
        ...formData,
        media_urls: cleanedMedia,
      };

      let res: Response;
      if (isEditMode) {
        res = await fetch(`/api/fish/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/fish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const result = await res.json();
      if (!res.ok) {
        alert("Gagal menyimpan data: " + (result.error ?? "Unknown error"));
      } else {
        setSuccess(true);
        if (!isEditMode) {
          setFormData({
            name: "", category: categories[0]?.name || "", price: "", size: "",
            image_url: "", stock: "1", description: "",
            grade: "Standard", purpose: "", color: "", gender: "",
            certified: false, health_status: "Siap Kirim", badge: "", featured: false,
            discount_percent: "0",
            characteristic: "",
          });
          setMediaUrls([""]);
        }
        setTimeout(() => {
          setSuccess(false);
          if (isEditMode) router.push("/admin/koleksi");
        }, 2000);
      }
    } catch {
      alert("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEdit) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/koleksi"
        className="inline-flex items-center text-zinc-400 hover:text-zinc-100 mb-8 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen Etalase
      </Link>

      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-indigo-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex items-center gap-4 mb-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Fish className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {isEditMode ? "Edit Spesimen" : "Entri Rekam Genetik"}
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mb-10 relative z-10">
          {isEditMode
            ? "Perbarui rincian spesifikasi ikan yang ada di basis data."
            : "Masukkan rincian spesifikasi mahakarya Ikan Anda agar masuk ke dalam basis data."}
        </p>

        {success && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">
              {isEditMode ? "Data berhasil diperbarui!" : "Data spesimen berhasil terinput ke dalam server Supabase!"}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* === Informasi Dasar === */}
          <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
              Informasi Dasar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Nama Spesimen / Jenis</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                  placeholder="Ex: Halfmoon Blue Rim"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300 flex items-center justify-between">
                  Klasifikasi Kategori
                  <Link href="/admin/kategori" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-normal transition-colors">
                    + Kelola Kategori
                  </Link>
                </label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 h-10 px-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
                    <span className="text-sm text-zinc-600">Memuat kategori...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex items-center gap-2 h-10 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400">Buat kategori dulu di <Link href="/admin/kategori" className="underline">Kategori & Tag</Link></span>
                  </div>
                ) : (
                  <select name="category" value={formData.category} onChange={handleChange} required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none">
                    <option value="" disabled>Pilih kategori...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-300">Harga Normal (Rp)</label>
                  <input type="number" name="price" required value={formData.price} onChange={handleChange}
                    placeholder="Ex: 500000" min="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-300 flex items-center justify-between">
                    Diskon (%)
                    {parseInt(formData.discount_percent) > 0 && formData.price && (
                      <span className="text-[11px] text-emerald-400 font-normal">
                        → Rp {new Intl.NumberFormat("id-ID").format(
                          Math.round(parseInt(formData.price) * (1 - parseInt(formData.discount_percent) / 100))
                        )}
                      </span>
                    )}
                  </label>
                  <input type="number" name="discount_percent" value={formData.discount_percent} onChange={handleChange}
                    min="0" max="100" placeholder="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-300">Ukuran (Size)</label>
                  <input type="text" name="size" required value={formData.size} onChange={handleChange}
                    placeholder="Ex: 15cm"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-300">Jumlah Stok</label>
                  <input type="number" name="stock" required value={formData.stock} onChange={handleChange} min="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>

              {/* Karakteristik */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">
                  Karakteristik Perilaku
                </label>
                <input
                  type="text"
                  name="characteristic"
                  value={formData.characteristic}
                  onChange={handleChange}
                  placeholder="Ex: Agresif / Alpha, Jinak, Aktif, Pemalu..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <p className="text-[11px] text-zinc-600">Tampil di halaman detail produk sebagai info tambahan</p>
              </div>
            </div>
          </div>

          {/* === Atribut Filter === */}
          <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
              Atribut Filter Katalog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Grade / Kualitas</label>
                <select name="grade" value={formData.grade} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Tujuan Pemeliharaan</label>
                <select name="purpose" value={formData.purpose} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                  <option value="">— Pilih Tujuan —</option>
                  {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Warna Dominan</label>
                <select name="color" value={formData.color} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                  <option value="">— Pilih Warna —</option>
                  {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                  <option value="">— Pilih Gender —</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Status Kesehatan</label>
                <select name="health_status" value={formData.health_status} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                  {HEALTH_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Badge Eksklusif</label>
                <select name="badge" value={formData.badge} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                  {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b === "" ? "— Tidak Ada Badge —" : b}</option>)}
                </select>
              </div>
            </div>

            {/* Checkbox row */}
            <div className="flex flex-wrap gap-6 mt-5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-5 h-5">
                  <input type="checkbox" name="certified" checked={formData.certified} onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border-2 border-zinc-700 bg-zinc-900 rounded checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer" />
                  <CheckCircle2 className="absolute top-0 left-0 text-white w-5 h-5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-200">Ada Sertifikat</span>
                  <p className="text-[11px] text-zinc-500">Ikan memiliki sertifikasi resmi</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-5 h-5">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border-2 border-zinc-700 bg-zinc-900 rounded checked:bg-amber-500 checked:border-amber-500 transition-all cursor-pointer" />
                  <CheckCircle2 className="absolute top-0 left-0 text-white w-5 h-5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-200">⭐ Featured / Highlight</span>
                  <p className="text-[11px] text-zinc-500">Tampilkan di bagian unggulan beranda</p>
                </div>
              </label>
            </div>
          </div>

          {/* === Media & Deskripsi === */}
          <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
              Media & Deskripsi
            </h2>
            <div className="space-y-6">

              {/* Thumbnail utama (image_url) */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300 flex justify-between items-center">
                  Foto Thumbnail Utama
                  <span className="text-[11px] text-zinc-500 font-normal">Digunakan di card katalog</span>
                </label>
                <input type="url" name="image_url" required value={formData.image_url} onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                {formData.image_url && (
                  <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </div>

              {/* Multi-media URLs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-zinc-300">
                    Galeri Media (Gambar & Video)
                  </label>
                  <span className="text-[11px] text-zinc-500">Support .jpg .png .mp4 .webm</span>
                </div>
                <div className="space-y-2">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {/* Preview thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                        {url.trim() === "" ? (
                          <ImageIcon className="w-5 h-5 text-zinc-700" />
                        ) : isVideo(url) ? (
                          <div className="relative w-full h-full">
                            <video src={url} muted className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Play className="w-4 h-4 fill-white text-white" />
                            </div>
                          </div>
                        ) : (
                          <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")} />
                        )}
                      </div>
                      {/* URL Input */}
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateMediaUrl(idx, e.target.value)}
                        placeholder={`URL Media ${idx + 1} — gambar atau video`}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                      {/* Remove button */}
                      {mediaUrls.length > 1 && (
                        <button type="button" onClick={() => removeMediaUrl(idx)}
                          className="p-2.5 rounded-xl text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addMediaUrl}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 rounded-xl hover:bg-indigo-500/10 transition-colors">
                  <Plus className="w-4 h-4" /> Tambah Media
                </button>
                <p className="text-[11px] text-zinc-600">
                  💡 Media pertama di galeri akan menjadi slide utama di halaman detail produk.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Deskripsi Kurator</label>
                <textarea name="description" required value={formData.description} onChange={handleChange} rows={4}
                  placeholder="Jelaskan karakteristik, warna genetik, dan mental dari ikan ini..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditMode ? "Simpan Perubahan" : "Publikasikan ke Etalase Supabase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TambahKoleksi() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <TambahKoleksiForm />
    </Suspense>
  );
}
