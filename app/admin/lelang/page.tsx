"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Gavel, Plus, Eye, Edit2, Trash2, CheckCircle2,
  XCircle, Clock, Flame, AlertCircle, Search, RefreshCw, Loader2, Users
} from "lucide-react";

interface Auction {
  id: string;
  fish_name: string;
  category: string;
  grade: string | null;
  current_price: number;
  start_price: number;
  bid_count: number;
  starts_at: string;
  ends_at: string;
  status: string;
  seller_name: string;
  views: number;
  is_featured: boolean;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  draft: { label: "Draft", class: "bg-zinc-700/50 text-zinc-400 border-zinc-700", icon: Edit2 },
  scheduled: { label: "Terjadwal", class: "bg-amber-500/10 text-amber-300 border-amber-500/30", icon: Clock },
  active: { label: "Live", class: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", icon: Flame },
  ended: { label: "Selesai", class: "bg-blue-500/10 text-blue-300 border-blue-500/30", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", class: "bg-red-500/10 text-red-300 border-red-500/30", icon: XCircle },
};

export default function AdminLelangPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState("");

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    const statusParam = filterStatus !== "all" ? `&status=${filterStatus}` : "&status=all";
    const res = await fetch(`/api/auctions?limit=50${statusParam}`);
    const data = await res.json();
    setAuctions(data.data || []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmDelete(null);
    const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAuctions((prev) => prev.filter((a) => a.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal menghapus lelang.");
    }
    setDeletingId(null);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/auctions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setAuctions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    }
  };

  const filtered = auctions.filter((a) =>
    a.fish_name.toLowerCase().includes(search.toLowerCase()) ||
    a.seller_name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    active: auctions.filter((a) => a.status === "active").length,
    scheduled: auctions.filter((a) => a.status === "scheduled").length,
    ended: auctions.filter((a) => a.status === "ended").length,
    totalBids: auctions.reduce((sum, a) => sum + a.bid_count, 0),
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0d1526] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Hapus Lelang?</h3>
                <p className="text-zinc-500 text-sm">Tindakan ini tidak bisa dibatalkan.</p>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <p className="text-zinc-300 text-sm font-semibold">{confirmDelete.name}</p>
              <p className="text-zinc-600 text-xs mt-0.5">Semua data bid juga akan terhapus.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-zinc-400 hover:text-zinc-200 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all"
              >
                {deletingId === confirmDelete.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manajemen Lelang</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Kelola semua sesi lelang ikan</p>
        </div>
        <Link
          href="/admin/lelang/tambah"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Lelang
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Live Sekarang", value: stats.active, icon: Flame, color: "text-emerald-400" },
          { label: "Terjadwal", value: stats.scheduled, icon: Clock, color: "text-amber-400" },
          { label: "Selesai", value: stats.ended, icon: CheckCircle2, color: "text-blue-400" },
          { label: "Total Bid", value: stats.totalBids, icon: Gavel, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama ikan atau seller..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {["all", "active", "scheduled", "ended", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filterStatus === s
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "Semua" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        <button
          onClick={fetchAuctions}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 bg-white/[0.03] border border-white/[0.06] px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-800 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Gavel className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">Belum ada lelang ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Ikan", "Status", "Harga Saat Ini", "Bid", "Berakhir", "Aksi"].map((h) => (
                    <th key={h} className="text-left text-[10px] text-zinc-600 uppercase tracking-widest font-semibold px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((auction) => {
                  const sc = STATUS_CONFIG[auction.status] || STATUS_CONFIG.draft;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={auction.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Nama */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{auction.fish_name}</p>
                            {auction.is_featured && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-600 text-xs capitalize mt-0.5">
                            {auction.category}
                            {auction.grade ? ` · Grade ${auction.grade}` : ""}
                          </p>
                        </div>
                      </td>

                      {/* Status + quick change */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full w-fit ${sc.class}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {sc.label}
                          </span>
                          {/* Quick status controls */}
                          {auction.status === "draft" && (
                            <button
                              onClick={() => handleStatusChange(auction.id, "scheduled")}
                              className="text-[10px] text-amber-400 hover:underline w-fit"
                            >
                              → Jadwalkan
                            </button>
                          )}
                          {auction.status === "scheduled" && (
                            <button
                              onClick={() => handleStatusChange(auction.id, "active")}
                              className="text-[10px] text-emerald-400 hover:underline w-fit"
                            >
                              → Aktifkan
                            </button>
                          )}
                          {auction.status === "active" && (
                            <button
                              onClick={() => handleStatusChange(auction.id, "ended")}
                              className="text-[10px] text-blue-400 hover:underline w-fit"
                            >
                              → Akhiri
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Harga */}
                      <td className="px-5 py-4">
                        <p className="text-emerald-400 font-bold">{formatRupiah(auction.current_price)}</p>
                        <p className="text-zinc-600 text-xs">mulai {formatRupiah(auction.start_price)}</p>
                      </td>

                      {/* Bid count */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Gavel className="w-3 h-3 text-zinc-600" />
                          <span className="font-semibold">{auction.bid_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-600 text-xs mt-0.5">
                          <Eye className="w-3 h-3" />
                          {auction.views}
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="px-5 py-4">
                        <p className="text-zinc-400 text-xs">
                          {new Date(auction.ends_at).toLocaleString("id-ID", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/lelang/${auction.id}`}
                            target="_blank"
                            className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-colors"
                            title="Lihat publik"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/lelang/${auction.id}/bidders`}
                            className="p-1.5 text-zinc-600 hover:text-violet-300 hover:bg-violet-500/[0.08] rounded-lg transition-colors"
                            title={`Lihat bidder (${auction.bid_count})`}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/lelang/${auction.id}/edit`}
                            className="p-1.5 text-zinc-600 hover:text-indigo-300 hover:bg-indigo-500/[0.08] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete({ id: auction.id, name: auction.fish_name })}
                            disabled={deletingId === auction.id}
                            className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-colors disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === auction.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
