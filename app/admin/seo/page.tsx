"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Globe,
  Edit2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Tag,
  FileText,
  Loader2
} from "lucide-react";
import Link from "next/link";

type SeoEntry = {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  og_image?: string;
  indexed: boolean;
  last_updated: string;
};

export default function AdminSeoPage() {
  const [entries, setEntries] = useState<SeoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<SeoEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editKeywords, setEditKeywords] = useState("");

  const fetchSeo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo");
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeo();
  }, [fetchSeo]);

  const openEdit = (entry: SeoEntry) => {
    setEditing(entry);
    setEditTitle(entry.title || "");
    setEditDesc(entry.description || "");
    setEditKeywords(entry.keywords || "");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/seo/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          keywords: editKeywords,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        alert("Gagal menyimpan SEO: " + (result.error ?? "Unknown error"));
      } else {
        setEditing(null);
        fetchSeo();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleIndexed = async (entry: SeoEntry) => {
    try {
      const res = await fetch(`/api/seo/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entry.title,
          description: entry.description,
          keywords: entry.keywords,
          indexed: !entry.indexed,
        }),
      });
      if (res.ok) fetchSeo();
    } catch {
      //
    }
  };

  const filtered = entries.filter(
    (e) =>
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      (e.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const scoreColor = (e: SeoEntry) => {
    const hasTitle = (e.title || "").length >= 50 && (e.title || "").length <= 60;
    const hasDesc = (e.description || "").length >= 150 && (e.description || "").length <= 160;
    const hasKeywords = (e.keywords || "").length > 0;
    const score = [hasTitle, hasDesc, hasKeywords].filter(Boolean).length;
    if (score === 3) return { label: "Optimal", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (score === 2) return { label: "Baik", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Perlu Perbaikan", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">SEO Pages</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">SEO Pages</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Kelola meta title, deskripsi, dan optimasi mesin pencari.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchSeo}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-all border border-zinc-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sinkronik Halaman
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Halaman", value: entries.length, icon: Globe, color: "text-indigo-400", bg: "bg-indigo-500/15" },
          { label: "Terindeks Google", value: entries.filter((e) => e.indexed).length, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/15" },
          { label: "Belum Terindeks", value: entries.filter((e) => !e.indexed).length, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/15" },
        ].map((s) => (
          <div key={s.label} className="bg-[#11121f] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? "-" : s.value}</p>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Cari path atau title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {loading ? (
             <div className="py-16 flex justify-center text-zinc-500">
               <Loader2 className="w-8 h-8 animate-spin" />
             </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">Belum ada data SEO.</div>
          ) : filtered.map((entry) => {
            const score = scoreColor(entry);
            const titleLength = (entry.title || "").length;
            const descLength = (entry.description || "").length;

            return (
              <div key={entry.id} className="px-5 py-4 hover:bg-white/[0.02] group transition-colors">
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <code className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">{entry.path}</code>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${score.bg} ${score.color}`}>
                          {score.label}
                        </span>
                        <button 
                          onClick={() => toggleIndexed(entry)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                            entry.indexed 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                              : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700/80"
                          }`}
                        >
                          {entry.indexed ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                          {entry.indexed ? "Terindeks" : "Belum Indeks"}
                        </button>
                      </div>
                      <p className="text-[13px] font-semibold text-zinc-200 truncate">{entry.title || "— Kosong —"}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{entry.description || "— Deskripsi kosong —"}</p>
                      
                      {entry.keywords && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {entry.keywords.split(",").slice(0, 3).map((kw, i) => (
                            <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-zinc-500">
                              <Tag className="w-2.5 h-2.5" />
                              {kw.trim()}
                            </span>
                          ))}
                          {entry.keywords.split(",").length > 3 && (
                            <span className="text-[10px] text-zinc-600">+{entry.keywords.split(",").length - 3} lagi</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                    <p className="text-[10px] text-zinc-600 mr-2">Update: {formatDate(entry.last_updated)}</p>
                    <Link href={entry.path} target="_blank" className="p-1.5 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Lihat halaman">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => openEdit(entry)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="Edit SEO"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SEO Length Indicators */}
                <div className="grid grid-cols-2 gap-3 mt-3 ml-11">
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                      <span>Title length</span>
                      <span className={titleLength >= 50 && titleLength <= 60 ? "text-emerald-400" : "text-amber-400"}>
                        {titleLength}/60
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          titleLength >= 50 && titleLength <= 60 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                      <span>Description length</span>
                      <span className={descLength >= 150 && descLength <= 160 ? "text-emerald-400" : "text-amber-400"}>
                        {descLength}/160
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          descLength >= 150 && descLength <= 160 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-base font-bold text-zinc-100 mb-1">Edit SEO</h2>
            <code className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded w-fit mb-5 block">{editing.path}</code>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Meta Title</label>
                  <span className={`text-[10px] ${editTitle.length >= 50 && editTitle.length <= 60 ? "text-emerald-400" : "text-amber-400"}`}>
                    {editTitle.length}/60
                  </span>
                </div>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Meta Description</label>
                  <span className={`text-[10px] ${editDesc.length >= 150 && editDesc.length <= 160 ? "text-emerald-400" : "text-amber-400"}`}>
                    {editDesc.length}/160
                  </span>
                </div>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Keywords (pisah koma)</label>
                <input
                  value={editKeywords}
                  onChange={(e) => setEditKeywords(e.target.value)}
                  placeholder="ikan cupang, jual koi, arwana murah..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.04] text-zinc-300 text-sm font-semibold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan SEO"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
