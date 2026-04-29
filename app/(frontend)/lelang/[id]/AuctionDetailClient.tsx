"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Gavel, Eye, TrendingUp, ChevronLeft, User,
  MapPin, Clock, AlertCircle, Share2, MessageCircle, Wifi, WifiOff,
  ChevronRight, X, Play, ZoomIn, Image as ImageIcon
} from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import BidForm from "@/components/BidForm";
import { supabase } from "@/lib/supabase";

interface Bid {
  id: string;
  bidder_name: string;
  bidder_city: string | null;
  amount: number;
  created_at: string;
}

interface Auction {
  id: string;
  fish_name: string;
  species: string | null;
  category: string;
  grade: string | null;
  size_cm: number | null;
  description: string | null;
  image_urls: string[];
  start_price: number;
  current_price: number;
  buy_now_price: number | null;
  bid_increment: number;
  bid_count: number;
  starts_at: string;
  ends_at: string;
  status: string;
  seller_name: string;
  seller_wa: string | null;
  video_url: string | null;
  views: number;
  is_featured: boolean;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
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

export default function AuctionDetailClient({ auctionId }: { auctionId: string }) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null); // index foto di lightbox
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [newBidFlash, setNewBidFlash] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/auctions/${auctionId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Lelang tidak ditemukan");
      const data = await res.json();
      setAuction(data.auction);
      setBids(data.bids || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  // Initial fetch + Supabase Realtime subscription
  useEffect(() => {
    fetchData();

    // Subscribe ke perubahan tabel bids secara real-time
    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          const newBid = payload.new as Bid;

          // Update leaderboard
          setBids((prev) => {
            const updated = [newBid, ...prev];
            return updated.sort((a, b) => b.amount - a.amount).slice(0, 20);
          });

          // Update harga saat ini
          setAuction((prev) =>
            prev ? { ...prev, current_price: newBid.amount, bid_count: prev.bid_count + 1 } : prev
          );

          // Flash animasi bid baru
          setNewBidFlash(true);
          setTimeout(() => setNewBidFlash(false), 1500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          setAuction((prev) => prev ? { ...prev, ...payload.new } : prev);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId, fetchData]);

  const handleBidSuccess = (newPrice: number, isBuyNow: boolean) => {
    if (!auction) return;
    setAuction((prev) =>
      prev
        ? {
            ...prev,
            current_price: newPrice,
            bid_count: prev.bid_count + 1,
            status: isBuyNow ? "ended" : prev.status,
          }
        : prev
    );
    // Realtime akan handle update leaderboard otomatis
    // fetchData() hanya dipanggil jika diperlukan fallback
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: auction?.fish_name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Lightbox keyboard nav — harus di atas early returns (rules of hooks)
  useEffect(() => {
    if (lightbox === null) return;
    const totalImages = auction?.image_urls?.length || 1;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => i !== null ? Math.min(i + 1, totalImages - 1) : null);
      if (e.key === "ArrowLeft") setLightbox((i) => i !== null ? Math.max(i - 1, 0) : null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, auction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm">Memuat detail lelang...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-3" />
          <p className="text-zinc-400 font-semibold">{error || "Lelang tidak ditemukan"}</p>
          <a href="/lelang" className="mt-4 inline-block text-emerald-400 text-sm hover:underline">
            ← Kembali ke daftar lelang
          </a>
        </div>
      </div>
    );
  }

  const images = auction.image_urls?.length ? auction.image_urls : ["/placeholder-fish.jpg"];
  const hasVideo = !!auction.video_url;
  const priceRise = auction.bid_count > 0
    ? Math.round(((auction.current_price - auction.start_price) / auction.start_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#050810]">
      {/* Topbar — Full Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#050810]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">

          {/* Left: Logo + Back */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="/lelang"
              className="flex items-center justify-center w-8 h-8 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] rounded-lg transition-all"
              title="Kembali ke daftar lelang"
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-400 transition-colors">
                <span className="text-white font-black text-sm">🐠</span>
              </div>
              <span className="hidden sm:block font-bold text-white text-base tracking-tight">
                Ikanpedia<span className="text-emerald-400">.id</span>
              </span>
            </a>
          </div>

          {/* Center: Auction title */}
          <div className="flex-1 min-w-0 px-2">
            <div className="flex items-center gap-2">
              {/* Realtime dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isConnected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" : "bg-zinc-700"
              }`} />
              <p className="text-white font-semibold text-sm truncate">{auction.fish_name}</p>
              <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full flex-shrink-0 ${
                isConnected
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : "text-zinc-600 border-zinc-800"
              }`}>
                {isConnected
                  ? <><Wifi className="w-2.5 h-2.5" /> Live</>
                  : <><WifiOff className="w-2.5 h-2.5" /> Connecting</>
                }
              </span>
            </div>
            <p className="text-zinc-600 text-[11px] truncate hidden sm:block">
              {auction.category}{auction.grade ? ` · Grade ${auction.grade}` : ""}
              {" · "}<a href="/lelang" className="hover:text-zinc-400 transition-colors">← Daftar Lelang</a>
            </p>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2.5 py-2 sm:px-3 rounded-xl transition-all"
              title="Bagikan"
            >
              <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{copied ? "Disalin!" : "Bagikan"}</span>
            </button>

            {/* WhatsApp Seller */}
            {auction.seller_wa && (
              <a
                href={`https://wa.me/${auction.seller_wa}?text=Halo%20Kak,%20saya%20ingin%20tanya%20tentang%20lelang%20${encodeURIComponent(auction.fish_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                title="WhatsApp Seller"
              >
                <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">WA Seller</span>
                <span className="sm:hidden">WA</span>
              </a>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-6">
            {/* Media Gallery */}
            <div className="space-y-3">
              {/* Tab selector (Foto / Video) */}
              {hasVideo && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("image")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      activeTab === "image"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "border-white/[0.08] text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Foto ({images.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("video")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      activeTab === "video"
                        ? "bg-red-500/15 border-red-500/30 text-red-300"
                        : "border-white/[0.08] text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    Video
                  </button>
                </div>
              )}

              {/* ---- FOTO TAB ---- */}
              {activeTab === "image" && (
                <div className="space-y-2">
                  {/* Main image */}
                  <div
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0f1e] cursor-zoom-in group"
                    onClick={() => setLightbox(activeImg)}
                  >
                    <Image
                      src={images[activeImg]}
                      alt={auction.fish_name}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      priority
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-fish.jpg"; }}
                    />

                    {/* Zoom hint */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                        <ZoomIn className="w-3 h-3" />
                        Klik untuk perbesar
                      </div>
                    </div>

                    {/* Nav arrows (multi-image) */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveImg((i) => Math.max(i - 1, 0)); }}
                          disabled={activeImg === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 disabled:opacity-0 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveImg((i) => Math.min(i + 1, images.length - 1)); }}
                          disabled={activeImg === images.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 disabled:opacity-0 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Status overlay */}
                    {auction.status === "active" && (
                      <div className="absolute top-4 left-4">
                        <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE AUCTION
                        </span>
                      </div>
                    )}

                    {/* Counter */}
                    {images.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {activeImg + 1} / {images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            activeImg === i
                              ? "border-emerald-500 opacity-100"
                              : "border-white/[0.08] opacity-50 hover:opacity-90"
                          }`}
                        >
                          <Image src={img} alt={`Foto ${i + 1}`} fill sizes="64px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---- VIDEO TAB ---- */}
              {activeTab === "video" && auction.video_url && (
                <VideoPlayer url={auction.video_url} title={auction.fish_name} />
              )}
            </div>

            {/* ---- LIGHTBOX ---- */}
            {lightbox !== null && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                onClick={() => setLightbox(null)}
              >
                {/* Close */}
                <button
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                  onClick={() => setLightbox(null)}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Prev */}
                {lightbox > 0 && (
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                    onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i ?? 1) - 1); }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Next */}
                {lightbox < images.length - 1 && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                    onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i ?? 0) + 1); }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Image */}
                <div
                  className="relative max-w-5xl max-h-[90vh] w-full h-full mx-16"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={images[lightbox]}
                    alt={`Foto ${lightbox + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-fish.jpg"; }}
                  />
                </div>

                {/* Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === lightbox ? "bg-white w-4" : "bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Ikan */}
            <div className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full uppercase">
                  {auction.category}
                </span>
                {auction.grade && (
                  <span className="text-xs font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full">
                    Grade {auction.grade}
                  </span>
                )}
                {auction.size_cm && (
                  <span className="text-xs bg-white/[0.05] border border-white/[0.08] text-zinc-400 px-3 py-1 rounded-full">
                    {auction.size_cm} cm
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs text-zinc-600">
                  <Eye className="w-3 h-3" />
                  {auction.views} dilihat
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {auction.fish_name}
              </h1>

              {auction.species && (
                <p className="text-zinc-500 italic text-sm">{auction.species}</p>
              )}

              {/* Price stats — flash on new bid */}
              <div className={`grid grid-cols-3 gap-3 rounded-2xl transition-all duration-500 ${
                newBidFlash ? "ring-2 ring-emerald-500/40 ring-offset-0" : ""
              }`}>
                {[
                  { label: "Harga Awal", value: formatRupiah(auction.start_price), sub: null },
                  { label: "Bid Tertinggi", value: formatRupiah(auction.current_price), sub: priceRise > 0 ? `+${priceRise}%` : null },
                  { label: "Total Bid", value: auction.bid_count.toString(), sub: `+${formatRupiah(auction.bid_increment)}/bid` },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-white font-bold text-sm">{value}</p>
                    {sub && (
                      <p className="text-emerald-400 text-[10px] mt-0.5 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Deskripsi */}
              {auction.description && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    Deskripsi
                  </h2>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {auction.description}
                  </p>
                </div>
              )}

              {/* Seller info */}
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {auction.seller_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{auction.seller_name}</p>
                  <p className="text-zinc-600 text-xs">Seller Terverifikasi</p>
                </div>
              </div>
            </div>

            {/* Leaderboard Bid (mobile hidden, desktop shown) */}
            <div className="lg:block">
              <BidLeaderboard bids={bids} currentPrice={auction.current_price} />
            </div>
          </div>

          {/* ===== RIGHT COLUMN (sticky) ===== */}
          <div className="space-y-5">
            {/* Countdown */}
            <div className="bg-[#0f172a] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  {auction.status === "scheduled" ? "Dimulai dalam" : "Berakhir dalam"}
                </span>
              </div>
              <CountdownTimer
                endsAt={auction.ends_at}
                startsAt={auction.starts_at}
                status={auction.status}
                size="lg"
                onExpired={fetchData}
              />
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-600">
                <span>
                  Berakhir: {new Date(auction.ends_at).toLocaleString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Bid Form */}
            <BidForm
              auctionId={auction.id}
              currentPrice={auction.current_price}
              bidIncrement={auction.bid_increment}
              buyNowPrice={auction.buy_now_price}
              status={auction.status}
              onBidSuccess={handleBidSuccess}
            />

            {/* Leaderboard mobile */}
            <div className="lg:hidden">
              <BidLeaderboard bids={bids} currentPrice={auction.current_price} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Bid Leaderboard Sub-component ----
function BidLeaderboard({ bids, currentPrice }: { bids: Bid[]; currentPrice: number }) {
  if (bids.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center">
        <Gavel className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
        <p className="text-zinc-600 text-sm">Belum ada bid. Jadilah yang pertama!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Leaderboard Bidder</h3>
        <span className="ml-auto text-xs text-zinc-600">{bids.length} bid</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {bids.slice(0, 10).map((bid, i) => {
          const isWinner = bid.amount === currentPrice && i === 0;
          return (
            <div
              key={bid.id}
              className={`flex items-center gap-3 px-5 py-3 ${isWinner ? "bg-emerald-500/[0.07]" : ""}`}
            >
              {/* Rank */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0
                    ? "bg-yellow-500 text-black"
                    : i === 1
                    ? "bg-zinc-400 text-black"
                    : i === 2
                    ? "bg-amber-700 text-white"
                    : "bg-white/[0.05] text-zinc-600"
                }`}
              >
                {i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-600" />
                  <p className="text-white text-sm font-semibold truncate">{bid.bidder_name}</p>
                  {isWinner && (
                    <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">
                      #1
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {bid.bidder_city && (
                    <div className="flex items-center gap-0.5 text-[10px] text-zinc-600">
                      <MapPin className="w-2.5 h-2.5" />
                      {bid.bidder_city}
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-700">{timeAgo(bid.created_at)}</p>
                </div>
              </div>

              {/* Amount */}
              <p className={`text-sm font-bold flex-shrink-0 ${isWinner ? "text-emerald-400" : "text-zinc-400"}`}>
                {formatRupiah(bid.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Video Player Sub-component ----
function VideoPlayer({ url, title }: { url: string; title: string }) {
  // Detect video type and build embed URL
  const getVideoEmbed = (rawUrl: string): { type: "youtube" | "tiktok" | "native"; src: string } => {
    // YouTube
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      return { type: "youtube", src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` };
    }

    // TikTok
    const ttMatch = rawUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (ttMatch) {
      return { type: "tiktok", src: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };
    }

    // Direct video (mp4, webm, etc)
    return { type: "native", src: rawUrl };
  };

  const embed = getVideoEmbed(url);

  return (
    <div className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden bg-[#0a0f1e] aspect-video">
        {embed.type === "native" ? (
          <video
            src={embed.src}
            controls
            playsInline
            className="w-full h-full object-contain"
            title={title}
          />
        ) : (
          <iframe
            src={embed.src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
        <Play className="w-3 h-3" />
        {embed.type === "youtube" && "YouTube Video"}
        {embed.type === "tiktok" && "TikTok Video"}
        {embed.type === "native" && "Video langsung"}
      </div>
    </div>
  );
}
