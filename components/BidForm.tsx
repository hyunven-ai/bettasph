"use client";

import { useState, useEffect } from "react";
import { Gavel, Phone, User, MapPin, Loader2, CheckCircle2, AlertCircle, BookUser, X } from "lucide-react";

const LS_KEY = "ikanpedia_bidder_profile";

interface BidderProfile {
  name: string;
  wa: string;
  city: string;
}

function loadProfile(): BidderProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: BidderProfile) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  } catch {}
}

function clearProfile() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

interface BidFormProps {
  auctionId: string;
  currentPrice: number;
  bidIncrement: number;
  buyNowPrice: number | null;
  status: string;
  onBidSuccess: (newPrice: number, isBuyNow: boolean) => void;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

type FormState = "idle" | "loading" | "success" | "error";

export default function BidForm({
  auctionId,
  currentPrice,
  bidIncrement,
  buyNowPrice,
  status,
  onBidSuccess,
}: BidFormProps) {
  const minBid = currentPrice + bidIncrement;

  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [city, setCity] = useState("");
  const [amount, setAmount] = useState(minBid);
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    const profile = loadProfile();
    if (profile?.name) {
      setName(profile.name);
      setWa(profile.wa || "");
      setCity(profile.city || "");
      setIsRemembered(true);
    }
  }, []);

  const handleForgetMe = () => {
    clearProfile();
    setName("");
    setWa("");
    setCity("");
    setIsRemembered(false);
  };

  const quickBids = [minBid, minBid + bidIncrement, minBid + bidIncrement * 2];

  const handleSubmit = async (e: React.FormEvent, forceBuyNow = false) => {
    e.preventDefault();
    if (!name.trim() || !wa.trim()) return;

    const finalAmount = forceBuyNow && buyNowPrice ? buyNowPrice : amount;

    setFormState("loading");
    setMessage("");

    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidder_name: name.trim(),
          bidder_wa: wa.trim(),
          bidder_city: city.trim() || undefined,
          amount: finalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormState("error");
        setMessage(data.error || "Gagal memasukkan bid.");
        if (data.min_bid) setAmount(data.min_bid);
        return;
      }

      setFormState("success");
      setIsBuyNow(data.is_buy_now);
      setMessage(
        data.is_buy_now
          ? `🎉 Selamat! Kamu berhasil membeli dengan Buy Now ${formatRupiah(finalAmount)}`
          : `✅ Bid ${formatRupiah(finalAmount)} berhasil! Kamu sementara jadi penawar tertinggi.`
      );

      // Simpan profil ke localStorage supaya tidak perlu isi ulang
      saveProfile({ name: name.trim(), wa: wa.trim(), city: city.trim() });
      setIsRemembered(true);

      onBidSuccess(data.new_price, data.is_buy_now);

      // Reset form (kecuali nama, WA & kota untuk convenience)
      setAmount(finalAmount + bidIncrement);
    } catch {
      setFormState("error");
      setMessage("Koneksi gagal. Coba lagi.");
    }
  };

  const isActive = status === "active";
  const isEnded = status === "ended";

  if (isEnded) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <Gavel className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-400 font-semibold">Lelang telah berakhir</p>
        <p className="text-zinc-600 text-sm mt-1">Harga akhir: {formatRupiah(currentPrice)}</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="rounded-2xl border border-amber-800/40 bg-amber-900/10 p-6 text-center">
        <p className="text-amber-400 font-semibold">Lelang belum dimulai</p>
        <p className="text-amber-500/70 text-sm mt-1">Tunggu hingga jadwal lelang dimulai.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.08] bg-[#0f172a] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Pasang Bid</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500">Minimal bid</p>
          <p className="font-bold text-emerald-400 text-sm">{formatRupiah(minBid)}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick Bid Buttons */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Pilihan cepat</p>
          <div className="flex gap-2 flex-wrap">
            {quickBids.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  amount === q
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-white/10 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-300"
                }`}
              >
                {formatRupiah(q)}
              </button>
            ))}
          </div>
        </div>

        {/* Nominal input */}
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1.5">
            Nominal Bid (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">Rp</span>
            <input
              type="number"
              value={amount}
              min={minBid}
              step={bidIncrement}
              onChange={(e) => setAmount(parseInt(e.target.value) || minBid)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>
          {amount < minBid && (
            <p className="text-red-400 text-[11px] mt-1">
              Minimal bid {formatRupiah(minBid)}
            </p>
          )}
        </div>

        {/* Remembered profile badge */}
        {isRemembered && (
          <div className="flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl px-3 py-2">
            <BookUser className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-[11px] font-medium flex-1">
              Data kamu tersimpan — tidak perlu isi ulang
            </p>
            <button
              type="button"
              onClick={handleForgetMe}
              className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
              title="Hapus data tersimpan"
            >
              <X className="w-3 h-3" />
              Lupa saya
            </button>
          </div>
        )}

        {/* Nama */}
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1.5">Nama Lengkap</label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isRemembered ? "text-emerald-600" : "text-zinc-600"}`} />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setIsRemembered(false); }}
              placeholder="Nama kamu"
              className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                isRemembered
                  ? "border-emerald-500/30 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                  : "border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/20"
              }`}
              required
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1.5">
            Nomor WhatsApp <span className="text-zinc-600">(untuk konfirmasi)</span>
          </label>
          <div className="relative">
            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isRemembered ? "text-emerald-600" : "text-zinc-600"}`} />
            <input
              type="tel"
              value={wa}
              onChange={(e) => { setWa(e.target.value); setIsRemembered(false); }}
              placeholder="08xx-xxxx-xxxx"
              className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                isRemembered
                  ? "border-emerald-500/30 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                  : "border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/20"
              }`}
              required
            />
          </div>
        </div>

        {/* Kota (opsional) */}
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1.5">
            Kota <span className="text-zinc-700">(opsional)</span>
          </label>
          <div className="relative">
            <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isRemembered ? "text-emerald-600" : "text-zinc-600"}`} />
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setIsRemembered(false); }}
              placeholder="Jakarta, Surabaya, ..."
              className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                isRemembered
                  ? "border-emerald-500/30 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                  : "border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/20"
              }`}
            />
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`flex items-start gap-2.5 rounded-xl p-3 text-sm ${
            formState === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}>
            {formState === "success"
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            }
            <p>{message}</p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="submit"
            disabled={formState === "loading" || amount < minBid || !name || !wa}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-sm"
          >
            {formState === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Gavel className="w-4 h-4" />
            )}
            {formState === "loading" ? "Memproses..." : `Bid ${formatRupiah(amount)}`}
          </button>

          {buyNowPrice && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={formState === "loading" || !name || !wa}
              className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/40 text-amber-300 font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              ⚡ Beli Langsung {formatRupiah(buyNowPrice)}
            </button>
          )}
        </div>

        <p className="text-[10px] text-zinc-600 text-center">
          Dengan memasang bid, kamu setuju dengan{" "}
          <a href="/syarat-ketentuan" className="text-zinc-500 underline underline-offset-2">
            syarat & ketentuan
          </a>{" "}
          lelang ikanpedia.id
        </p>
      </div>
    </form>
  );
}
