"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  User,
  Eye,
  Search,
  ChevronRight,
  Loader2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  created_at: string;
  published: boolean;
  image_url?: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Hapus artikel "${title}" secara permanen?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        alert("Gagal menghapus: " + (result.error ?? "Unknown error"));
      } else {
        fetchPosts();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true : filter === "published" ? p.published : !p.published;
    return matchSearch && matchFilter;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">Blog & Artikel</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Blog & Artikel</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Kelola konten jurnal edukasi ikan hias Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            className="p-2 bg-[#11121f] border border-white/[0.06] hover:bg-white/[0.04] text-zinc-400 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/blog/tulis"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.25)]"
          >
            <Plus className="w-4 h-4" />
            Artikel Baru
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Artikel", value: posts.length, color: "text-indigo-400" },
          { label: "Dipublikasi", value: posts.filter((p) => p.published).length, color: "text-emerald-400" },
          { label: "Draft", value: posts.filter((p) => !p.published).length, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#11121f] border border-white/[0.06] rounded-2xl p-5">
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-[#11121f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f === "all" ? "Semua" : f === "published" ? "Publik" : "Draft"}
              </button>
            ))}
          </div>
        </div>

        {/* Post List */}
        <div className="divide-y divide-white/[0.04]">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm">
              {search || filter !== "all" ? "Tidak ada artikel yang sesuai." : "Belum ada artikel."}
            </div>
          ) : (
            filtered.map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] group transition-colors">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        post.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {post.published ? "Publik" : "Draft"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-zinc-200 truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-600">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Link href={`/blog/${post.slug}`} target="_blank" className="p-1.5 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Lihat">
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <Link href={`/admin/blog/tulis?edit=${post.id}`} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={deletingId === post.id}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40" 
                    title="Hapus"
                  >
                    {deletingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
