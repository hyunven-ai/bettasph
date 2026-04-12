"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon, Upload, Trash2, Copy, ChevronRight,
  CheckCircle, Grid, List, Search, Loader2, RefreshCw
} from "lucide-react";

type GalleryItem = {
  id: string;
  url: string;
  filename: string;
  size: string;
  created_at: string;
};

export default function AdminGaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  
  // States for URL upload
  const [urlInput, setUrlInput] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  
  // States for File Drop upload
  const [dragging, setDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const filtered = items.filter((item) =>
    item.filename?.toLowerCase().includes(search.toLowerCase())
  );

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Hapus foto ini secara permanen?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert("Gagal menghapus: " + (err.error ?? "Unknown error"));
      } else {
        setSelected((prev) => prev.filter((s) => s !== id));
        fetchGallery();
      }
    } finally {
      setDeletingId(null);
    }
  };

  /* --- Tambah Foto via URL --- */
  const addFromUrl = async () => {
    if (!urlInput.trim()) return;
    setSavingUrl(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Gagal menambah: " + (err.error ?? "Unknown error"));
      } else {
        setUrlInput("");
        fetchGallery();
      }
    } finally {
      setSavingUrl(false);
    }
  };

  /* --- Tambah Foto via Drag & Drop File --- */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Pastikan itu gambar
      if (!file.type.startsWith('image/')) {
        alert("Hanya file gambar yang diperbolehkan!");
        return;
      }

      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert("Gagal mengunggah file: " + (err.error ?? "Unknown error"));
        } else {
          fetchGallery(); // Refresh jika berhasil
        }
      } catch (error) {
        alert("Terjadi kesalahan jaringan saat mengunggah file.");
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert("Hanya file gambar yang diperbolehkan!");
        return;
      }

      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert("Gagal mengunggah file: " + (err.error ?? "Unknown error"));
        } else {
          fetchGallery();
        }
      } catch (error) {
        alert("Terjadi kesalahan jaringan saat mengunggah file.");
      } finally {
        setUploadingFile(false);
        // Reset input type file
        e.target.value = '';
      }
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const deleteSelected = async () => {
    if (!window.confirm(`Hapus ${selected.length} foto secara permanen?`)) return;
    
    // We'll delete them sequentially for simplicity
    for (const id of selected) {
      await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    }
    
    setSelected([]);
    fetchGallery();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span><ChevronRight className="w-3 h-3" /><span className="text-zinc-300">Galeri Foto</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Galeri Foto</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{items.length} foto tersimpan di perpustakaan media.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGallery}
            className="p-2 bg-[#11121f] border border-white/[0.06] hover:bg-white/[0.04] text-zinc-400 rounded-xl transition-colors"
            title="Refresh Galeri"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {selected.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Hapus {selected.length} item
            </button>
          )}
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative bg-[#11121f] border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragging ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-800 hover:border-zinc-700"
        } ${uploadingFile ? "opacity-50 pointer-events-none" : ""}`}
      >
        {uploadingFile && (
           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#11121f]/80 backdrop-blur-sm rounded-2xl">
             <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
             <p className="text-sm font-medium text-white">Mengunggah file...</p>
           </div>
        )}

        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 cursor-pointer relative overflow-hidden group hover:bg-indigo-500/20 transition-colors">
          <Upload className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            title="Pilih gambar dari komputer"
          />
        </div>
        <p className="text-sm font-semibold text-zinc-300 mb-1">
          Seret & lepas foto di sini atau klik icon panah
        </p>
        <p className="text-xs text-zinc-600 mb-6">Maksimal 5MB (Format JPEG/PNG)</p>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px bg-white/10 w-24"></div>
          <span className="text-xs text-zinc-500 tracking-wider">ATAU</span>
          <div className="h-px bg-white/10 w-24"></div>
        </div>

        <div className="flex items-center gap-2 max-w-md mx-auto">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFromUrl()}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={addFromUrl}
            disabled={savingUrl}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {savingUrl ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Simpan URL"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Cari nama file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#11121f] border border-white/[0.06] rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#11121f] border border-white/[0.06] rounded-lg p-1 ml-auto">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-md transition-colors ${view === "grid" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl py-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl py-16 text-center text-zinc-600 text-sm">
          {search ? "Tidak ada foto yang cocok dengan pencarian." : "Belum ada foto di galeri."}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                selected.includes(item.id) ? "border-indigo-500" : "border-transparent"
              }`}
            >
              <div className="aspect-square bg-zinc-900">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {selected.includes(item.id) && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); copyUrl(item.url, item.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm transition-colors"
                >
                  {copied === item.id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === item.id ? "Disalin!" : "Salin URL"}
                </button>
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  disabled={deletingId === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white text-xs rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
                >
                  {deletingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Hapus
                </button>
              </div>
              <div className="bg-zinc-900/90 px-2 py-1.5">
                <p className="text-[10px] text-zinc-400 truncate">{item.filename}</p>
                <p className="text-[9px] text-zinc-600">{formatDate(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] group transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="w-4 h-4 rounded border-zinc-700 accent-indigo-500"
              />
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-200 truncate">{item.filename}</p>
                <p className="text-[10px] text-zinc-600">{item.size} · {formatDate(item.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyUrl(item.url, item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
                >
                  {copied === item.id ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied === item.id ? "Tersalin" : "Salin URL"}
                </button>
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  disabled={deletingId === item.id}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
                >
                  {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
