"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft, MessageCircle, Phone, User, MapPin, Trophy,
  Crown, Gavel, Download, Copy, CheckCircle2, RefreshCw,
  AlertCircle, Clock, TrendingUp, Users
} from "lucide-react";

interface Bidder {
  id: string;
  bidder_name: string;
  bidder_wa: string;
  bidder_city: string | null;
  amount: number;
  created_at: string;
}

interface AuctionInfo {
  id: string;
  fish_name: string;
  category: string;
  grade: string | null;
  status: string;
  current_price: number;
  bid_count: number;
  ends_at: string;
  seller_name: string;
}

interface ApiData {
  auction: AuctionInfo;
  bidders: Bidder[];
  total_unique_bidders: number;
  total_bids: number;
  winner: Bidder | null;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatWa(wa: string): string {
  // Normalize ke format internasional 628xx
  let clean = wa.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.slice(1);
  if (!clean.startsWith("62")) clean = "62" + clean;
  return clean;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Live", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ended: { label: "Selesai", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  scheduled: { label: "Terjadwal", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  draft: { label: "Draft", color: "text-zinc-400 bg-zinc-700/30 border-zinc-700" },
};

export default function BiddersPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedWa, setCopiedWa] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/auctions/${id}/bidders`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data.");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyWa = async (wa: string) => {
    await navigator.clipboard.writeText(wa);
    setCopiedWa(wa);
    setTimeout(() => setCopiedWa(null), 2000);
  };

  const openWa = (bidder: Bidder, isWinner: boolean) => {
    const norm = formatWa(bidder.bidder_wa);
    const msg = isWinner
      ? `Selamat ${bidder.bidder_name}! 🎉 Anda memenangkan lelang *${data?.auction.fish_name}* dengan bid tertinggi *${formatRupiah(bidder.amount)}*. Silakan hubungi kami untuk konfirmasi pembayaran dan pengiriman. Terima kasih sudah berpartisipasi di ikanpedia.id! 🐠`
      : `Halo ${bidder.bidder_name}! Terima kasih sudah berpartisipasi di lelang *${data?.auction.fish_name}* di ikanpedia.id. Sayang kali ini Anda belum beruntung. Ikuti lelang berikutnya di ikanpedia.id! 🐠`;
    window.open(`https://wa.me/${norm}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Rank", "Nama", "WhatsApp", "Kota", "Bid Tertinggi", "Waktu Bid", "Status"],
      ...data.bidders.map((b, i) => [
        i + 1,
        b.bidder_name,
        b.bidder_wa,
        b.bidder_city || "-",
        b.amount,
        new Date(b.created_at).toLocaleString("id-ID"),
        i === 0 ? "PEMENANG" : "Kalah",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bidders-${data.auction.fish_name.replace(/\s+/g, "-")}-${id.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-indigo-800 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm">Memuat data bidder...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-32">
        <AlertCircle className="w-10 h-10 text-red-500/50" />
        <p className="text-zinc-400">{error || "Data tidak ditemukan"}</p>
        <button onClick={() => router.push("/admin/lelang")} className="text-indigo-400 hover:underline text-sm">
          ← Kembali ke daftar lelang
        </button>
      </div>
    );
  }

  const { auction, bidders, total_unique_bidders, total_bids, winner } = data;
  const statusCfg = STATUS_MAP[auction.status] || STATUS_MAP.draft;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.push("/admin/lelang")}
          className="p-2 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors mt-0.5"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">Data Bidder</h1>
            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-0.5">
            {auction.fish_name}
            {auction.grade ? ` · Grade ${auction.grade}` : ""}
            {" · "}
            <span className="capitalize">{auction.category}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          {bidders.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Bidder Unik", value: total_unique_bidders, icon: Users, color: "text-indigo-400" },
          { label: "Total Bid", value: total_bids, icon: Gavel, color: "text-emerald-400" },
          { label: "Harga Final", value: formatRupiah(auction.current_price), icon: TrendingUp, color: "text-amber-400" },
          {
            label: "Berakhir",
            value: new Date(auction.ends_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            icon: Clock,
            color: "text-zinc-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
            <p className="text-white font-bold text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Winner Card */}
      {winner && (
        <div className="relative bg-gradient-to-r from-amber-500/[0.08] to-yellow-500/[0.05] border border-amber-500/25 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  🏆 Pemenang Sementara
                </p>
              </div>
              <p className="text-white font-bold text-lg">{winner.bidder_name}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {winner.bidder_city && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="w-3 h-3" /> {winner.bidder_city}
                  </span>
                )}
                <span className="text-xs text-zinc-500">{winner.bidder_wa}</span>
                <span className="text-xs text-zinc-600">{timeAgo(winner.created_at)}</span>
              </div>
              <p className="text-amber-400 font-black text-xl mt-2">{formatRupiah(winner.amount)}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => openWa(winner, true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Pemenang
              </button>
              <button
                onClick={() => copyWa(winner.bidder_wa)}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 bg-white/[0.05] border border-white/[0.08] text-sm px-4 py-2 rounded-xl transition-colors"
              >
                {copiedWa === winner.bidder_wa
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!</>
                  : <><Copy className="w-3.5 h-3.5" /> Salin Nomor</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bidder Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Semua Bidder</h2>
          </div>
          <span className="text-xs text-zinc-600">{total_unique_bidders} bidder · {total_bids} bid total</span>
        </div>

        {bidders.length === 0 ? (
          <div className="text-center py-16">
            <Gavel className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">Belum ada bidder untuk lelang ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {bidders.map((bidder, i) => {
              const isWinner = i === 0;
              const isTop3 = i < 3;
              return (
                <div
                  key={bidder.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group ${
                    isWinner ? "bg-amber-500/[0.04]" : ""
                  }`}
                >
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      i === 0
                        ? "bg-yellow-500 text-black"
                        : i === 1
                        ? "bg-zinc-300 text-black"
                        : i === 2
                        ? "bg-amber-700 text-white"
                        : "bg-white/[0.05] text-zinc-600"
                    }`}
                  >
                    {isWinner ? <Trophy className="w-4 h-4" /> : i + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${isWinner ? "text-amber-300" : "text-white"}`}>
                        {bidder.bidder_name}
                      </p>
                      {isWinner && (
                        <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">
                          PEMENANG
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-zinc-600">
                        <Phone className="w-3 h-3" />
                        {bidder.bidder_wa}
                      </span>
                      {bidder.bidder_city && (
                        <span className="flex items-center gap-1 text-xs text-zinc-700">
                          <MapPin className="w-3 h-3" />
                          {bidder.bidder_city}
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-700">{timeAgo(bidder.created_at)}</span>
                    </div>
                  </div>

                  {/* Bid amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${isWinner ? "text-amber-400" : isTop3 ? "text-zinc-300" : "text-zinc-500"}`}>
                      {formatRupiah(bidder.amount)}
                    </p>
                    {isWinner && (
                      <p className="text-[10px] text-amber-500/70 mt-0.5">Bid tertinggi</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openWa(bidder, isWinner)}
                      title="Kirim WhatsApp"
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                        isWinner
                          ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-white/[0.05] hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 border border-white/[0.08]"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyWa(bidder.bidder_wa)}
                      title="Salin nomor WA"
                      className="w-8 h-8 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.10] text-zinc-500 hover:text-zinc-300 border border-white/[0.08] rounded-xl transition-all"
                    >
                      {copiedWa === bidder.bidder_wa
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        : <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info footer */}
      <p className="text-xs text-zinc-700 text-center">
        Data bidder bersifat rahasia. Nomor WA hanya digunakan untuk konfirmasi kemenangan dan pengiriman.
      </p>
    </div>
  );
}
