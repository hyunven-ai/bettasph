"use client";

import { useState, useEffect } from "react";
import { Fish, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Category = { id: string; name: string; slug: string; color: string };

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
  });

  // Load kategori dari API
  useEffect(() => {
    setLoadingCategories(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          // Set default category ke yang pertama jika belum ada
          setFormData((prev) => ({
            ...prev,
            category: prev.category || data[0].name,
          }));
        }
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingCategories(false));
  }, []);

  // Jika mode edit, ambil data existing
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
          });
        }
      })
      .catch(() => alert("Gagal memuat data untuk diedit."))
      .finally(() => setFetchingEdit(false));
  }, [editId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res: Response;

      if (isEditMode) {
        // Mode Edit — PUT ke /api/fish/:id
        res = await fetch(`/api/fish/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Mode Tambah — POST ke /api/fish
        res = await fetch("/api/fish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        alert("Gagal menyimpan data: " + (result.error ?? "Unknown error"));
      } else {
        setSuccess(true);
        if (!isEditMode) {
          setFormData({
            name: "",
            category: categories[0]?.name || "",
            price: "",
            size: "",
            image_url: "",
            stock: "1",
            description: "",
          });
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
              {isEditMode
                ? "Data berhasil diperbarui!"
                : "Data spesimen berhasil terinput ke dalam server Supabase!"}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-zinc-300">
                Nama Spesimen / Jenis
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Halfmoon Blue Rim"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
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
                  <span className="text-sm text-amber-400">Buat kategori dulu di halaman <Link href="/admin/kategori" className="underline">Kategori & Tag</Link></span>
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="" disabled>Pilih kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-zinc-300">
                Nilai Investasi (Harga Rp)
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 500000"
                min="0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">
                  Ukuran (Size)
                </label>
                <input
                  type="text"
                  name="size"
                  required
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Ex: M / 15cm"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">
                  Jumlah Stok
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[13px] font-semibold text-zinc-300 flex justify-between items-center">
              URL Foto Indikator
              <span className="text-[11px] text-zinc-500 font-normal">
                Sematkan link gambar publik via Unsplash / Imgur URL.
              </span>
            </label>
            <input
              type="url"
              name="image_url"
              required
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {formData.image_url && (
              <div className="mt-4 w-32 h-32 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[13px] font-semibold text-zinc-300">
              Deskripsi Kurator
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Jelaskan karakteristik, warna genetik, dan mental dari ikan ini..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="pt-6 border-t border-zinc-800/80">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isEditMode ? (
                "Simpan Perubahan"
              ) : (
                "Publikasikan ke Etalase Supabase"
              )}
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
