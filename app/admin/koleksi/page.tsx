"use client";

import { useEffect, useState } from "react";
import {
  Fish, Plus, Trash2, Edit2, Search, ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function AdminKoleksiPage() {
  const [fishList, setFishList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fish");
      const data = await res.json();
      if (Array.isArray(data)) setFishList(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus "${name}" secara permanen?`)) return;
    setDeleteLoading(id);
    const res = await fetch(`/api/fish/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const result = await res.json();
      alert("Gagal menghapus: " + (result.error ?? "Unknown error"));
    } else {
      fetchData();
    }
    setDeleteLoading(null);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);

  const categories = ["Semua", ...Array.from(new Set(fishList.map((f) => f.category)))];

  const filtered = fishList.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Semua" || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">Koleksi Ikan</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Koleksi Ikan</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Semua <span className="text-indigo-400 font-semibold">{fishList.length} ikan</span> dalam katalog inventaris.
          </p>
        </div>
        <Link
          href="/admin/tambah"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.25)]"
        >
          <Plus className="w-4 h-4" /> Tambah Ikan
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Cari nama ikan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors w-52"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-zinc-400 whitespace-nowrap">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-zinc-600 border-b border-white/[0.04]">
                <th className="px-6 py-3 text-left font-semibold">Koleksi</th>
                <th className="px-6 py-3 text-left font-semibold">Kategori</th>
                <th className="px-6 py-3 text-left font-semibold">Harga</th>
                <th className="px-6 py-3 text-left font-semibold">Stok</th>
                <th className="px-6 py-3 text-left font-semibold">Size</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-600 text-sm">
                    {search || categoryFilter !== "Semua"
                      ? "Tidak ada ikan yang sesuai filter."
                      : "Belum ada data koleksi ikan."}
                  </td>
                </tr>
              ) : (
                filtered.map((fish) => (
                  <tr key={fish.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                        <img src={fish.image_url} alt={fish.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-zinc-200">{fish.name}</p>
                        <p className="text-[10px] text-zinc-600 font-mono">{fish.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {fish.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-zinc-200 text-[13px]">
                      {formatPrice(fish.price)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[13px] font-semibold ${fish.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {fish.stock} Ekor
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-400 text-[13px]">{fish.size}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/tambah?edit=${fish.id}`}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
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

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-xs text-zinc-600">Menampilkan {filtered.length} dari {fishList.length} item</p>
          </div>
        )}
      </div>
    </div>
  );
}
