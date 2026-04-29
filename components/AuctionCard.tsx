"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Gavel, TrendingUp, Zap } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

interface Auction {
  id: string;
  fish_name: string;
  species: string | null;
  category: string;
  grade: string | null;
  size_cm: number | null;
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
  views: number;
  is_featured: boolean;
}

interface AuctionCardProps {
  auction: Auction;
}

const CATEGORY_COLORS: Record<string, string> = {
  betta: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  koi: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  arwana: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  guppy: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  other: "bg-purple-500/15 text-purple-300 border-purple-500/30",
};

const GRADE_COLORS: Record<string, string> = {
  "S+": "bg-yellow-400/20 text-yellow-300 border-yellow-400/50",
  "S": "bg-yellow-400/15 text-yellow-400 border-yellow-400/40",
  "A": "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  "B": "bg-blue-400/15 text-blue-300 border-blue-400/40",
  "C": "bg-zinc-400/15 text-zinc-400 border-zinc-400/40",
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const catColor = CATEGORY_COLORS[auction.category] || CATEGORY_COLORS.other;
  const gradeColor = auction.grade ? (GRADE_COLORS[auction.grade] || GRADE_COLORS.B) : null;
  const imgSrc = auction.image_urls?.[0] || "/placeholder-fish.jpg";

  const isActive = auction.status === "active";
  const isScheduled = auction.status === "scheduled";
  const isEnded = auction.status === "ended";

  const priceRise = auction.bid_count > 0
    ? Math.round(((auction.current_price - auction.start_price) / auction.start_price) * 100)
    : 0;

  return (
    <Link
      href={`/lelang/${auction.id}`}
      className="group relative flex flex-col bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1"
    >
      {/* Badge Featured */}
      {auction.is_featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/30">
          <Zap className="w-2.5 h-2.5" />
          Featured
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {isActive && (
          <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        {isScheduled && (
          <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            Akan Datang
          </span>
        )}
        {isEnded && (
          <span className="flex items-center gap-1 bg-zinc-700/90 backdrop-blur-sm text-zinc-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            Selesai
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#0a0f1e] overflow-hidden">
        <Image
          src={imgSrc}
          alt={auction.fish_name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-fish.jpg"; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-70" />

        {/* Countdown di atas gambar */}
        <div className="absolute bottom-3 left-3">
          <CountdownTimer
            endsAt={auction.ends_at}
            startsAt={auction.starts_at}
            status={auction.status}
            size="sm"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4">
        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wide ${catColor}`}>
            {auction.category}
          </span>
          {gradeColor && (
            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${gradeColor}`}>
              Grade {auction.grade}
            </span>
          )}
          {auction.size_cm && (
            <span className="text-[10px] text-zinc-500 bg-white/5 border border-white/[0.06] px-2 py-0.5 rounded-full">
              {auction.size_cm} cm
            </span>
          )}
        </div>

        {/* Nama ikan */}
        <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
          {auction.fish_name}
        </h3>

        {auction.species && (
          <p className="text-zinc-500 text-xs italic">{auction.species}</p>
        )}

        {/* Harga */}
        <div className="mt-1 pt-3 border-t border-white/[0.06]">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] text-zinc-500 mb-0.5">
                {auction.bid_count > 0 ? "Bid tertinggi" : "Harga mulai"}
              </p>
              <p className="text-lg font-bold text-emerald-400 leading-none">
                {formatRupiah(auction.current_price)}
              </p>
            </div>

            {priceRise > 0 && (
              <div className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                +{priceRise}%
              </div>
            )}
          </div>

          {auction.buy_now_price && (
            <p className="mt-1 text-[10px] text-amber-400">
              Beli Langsung: {formatRupiah(auction.buy_now_price)}
            </p>
          )}
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between text-zinc-600 text-[11px]">
          <div className="flex items-center gap-1">
            <Gavel className="w-3 h-3" />
            <span>{auction.bid_count} bid</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{auction.views}</span>
          </div>
          <span className="text-zinc-700">oleh {auction.seller_name}</span>
        </div>
      </div>
    </Link>
  );
}
