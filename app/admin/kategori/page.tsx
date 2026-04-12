"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag, Plus, Trash2, Edit2, ChevronRight, Check, X, Hash, Loader2, RefreshCw
} from "lucide-react";

type Category = { id: string; name: string; slug: string; color: string };
type TagItem  = { id: string; name: string; slug: string };

const COLORS = ["#818cf8","#34d399","#f59e0b","#f472b6","#60a5fa","#a78bfa","#fb923c"];

export default function AdminKategoriPage() {
  // ── Categories state ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(COLORS[0]);
  const [editCat, setEditCat] = useState<Category | null>(null);

  // ── Tags state ──
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [savingTag, setSavingTag] = useState(false);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");
  const [editTag, setEditTag] = useState<TagItem | null>(null);

  const toSlug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  /* ── Fetch Categories ── */
  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch { /* silent */ }
    finally { setLoadingCats(false); }
  }, []);

  /* ── Fetch Tags ── */
  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (Array.isArray(data)) setTags(data);
    } catch { /* silent */ }
    finally { setLoadingTags(false); }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  /* ── Category CRUD ── */
  const saveCategory = async () => {
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      if (editCat) {
        const res = await fetch(`/api/categories/${editCat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName, color: catColor }),
        });
        if (!res.ok) { const e = await res.json(); alert("Gagal update: " + (e.error ?? "Unknown")); }
        else { setEditCat(null); await fetchCategories(); }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName, color: catColor }),
        });
        if (!res.ok) { const e = await res.json(); alert("Gagal tambah: " + (e.error ?? "Unknown")); }
        else await fetchCategories();
      }
    } finally { setSavingCat(false); setCatName(""); setCatColor(COLORS[0]); }
  };

  const startEditCat = (c: Category) => { setEditCat(c); setCatName(c.name); setCatColor(c.color ?? COLORS[0]); };

  const deleteCat = async (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}" secara permanen?`)) return;
    setDeletingCat(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json(); alert("Gagal hapus: " + (e.error ?? "Unknown")); }
      else await fetchCategories();
    } finally { setDeletingCat(null); }
  };

  /* ── Tag CRUD ── */
  const saveTag = async () => {
    if (!tagName.trim()) return;
    setSavingTag(true);
    try {
      if (editTag) {
        const res = await fetch(`/api/tags/${editTag.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: tagName }),
        });
        if (!res.ok) { const e = await res.json(); alert("Gagal update tag: " + (e.error ?? "Unknown")); }
        else { setEditTag(null); await fetchTags(); }
      } else {
        const res = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: tagName }),
        });
        if (!res.ok) { const e = await res.json(); alert("Gagal tambah tag: " + (e.error ?? "Unknown")); }
        else await fetchTags();
      }
    } finally { setSavingTag(false); setTagName(""); }
  };

  const startEditTag = (t: TagItem) => { setEditTag(t); setTagName(t.name); };

  const deleteTag = async (id: string, name: string) => {
    if (!window.confirm(`Hapus tag "#${name}" secara permanen?`)) return;
    setDeletingTag(id);
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json(); alert("Gagal hapus tag: " + (e.error ?? "Unknown")); }
      else await fetchTags();
    } finally { setDeletingTag(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
          <span>Admin</span><ChevronRight className="w-3 h-3" /><span className="text-zinc-300">Kategori &amp; Tag</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Kategori &amp; Tag</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Kelola taksonomi konten dan label katalog ikan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── CATEGORIES ── */}
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
            <Tag className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-300">Kategori</h2>
            <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{categories.length}</span>
            <button onClick={fetchCategories} className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add/Edit Form */}
          <div className="px-6 py-4 border-b border-white/[0.04] bg-zinc-900/30 space-y-3">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              {editCat ? "Edit Kategori" : "Tambah Kategori Baru"}
            </p>
            <div className="flex items-center gap-2">
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCategory()}
                placeholder="Nama kategori..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setCatColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${catColor === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <button onClick={saveCategory} disabled={savingCat}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50">
                {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : editCat ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              {editCat && (
                <button onClick={() => { setEditCat(null); setCatName(""); setCatColor(COLORS[0]); }}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-600">
              Slug: <code className="text-indigo-400">{toSlug(catName) || "—"}</code>
            </p>
          </div>

          {/* Category List */}
          <div className="divide-y divide-white/[0.04]">
            {loadingCats ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-800 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-32" />
                    <div className="h-2 bg-zinc-800 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))
            ) : categories.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-zinc-600">
                Belum ada kategori. Tambahkan kategori pertama Anda!
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 px-6 py-3.5 group hover:bg-white/[0.02] transition-colors">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color ?? "#818cf8" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-200">{cat.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditCat(cat)}
                      className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCat(cat.id, cat.name)} disabled={deletingCat === cat.id}
                      className="p-1.5 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40">
                      {deletingCat === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── TAGS ── */}
        <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
            <Hash className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-300">Tag</h2>
            <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{tags.length}</span>
            <button onClick={fetchTags} className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add/Edit Form */}
          <div className="px-6 py-4 border-b border-white/[0.04] bg-zinc-900/30 space-y-3">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              {editTag ? "Edit Tag" : "Tambah Tag Baru"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">#</span>
              <input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTag()}
                placeholder="nama-tag..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={saveTag} disabled={savingTag}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50">
                {savingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : editTag ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              {editTag && (
                <button onClick={() => { setEditTag(null); setTagName(""); }}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-600">
              Slug: <code className="text-indigo-400">{toSlug(tagName) || "—"}</code>
            </p>
          </div>

          {/* Tag Chips */}
          <div className="p-6 flex flex-wrap gap-2">
            {loadingTags ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-zinc-800 rounded-lg animate-pulse" />
              ))
            ) : tags.length === 0 ? (
              <p className="text-sm text-zinc-600">Belum ada tag. Tambahkan tag pertama Anda!</p>
            ) : (
              tags.map((tag) => (
                <div key={tag.id}
                  className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-indigo-500/30 transition-all">
                  <span className="text-[12px] text-zinc-400 font-mono">#{tag.name}</span>
                  <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditTag(tag)}
                      className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => deleteTag(tag.id, tag.name)} disabled={deletingTag === tag.id}
                      className="text-zinc-600 hover:text-rose-400 transition-colors disabled:opacity-40">
                      {deletingTag === tag.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
