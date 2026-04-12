"use client";

import { useState, useEffect } from "react";
import {
  Settings, Globe, Phone, Mail, MapPin, ChevronRight,
  Save, CheckCircle, Bell, Shield, Palette, Store, MessageCircle, AlertCircle
} from "lucide-react";

type Tab = "toko" | "kontak" | "notifikasi" | "keamanan" | "tampilan";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "toko",       label: "Informasi Toko",  icon: Store    },
  { id: "kontak",     label: "Kontak & Sosmed", icon: MapPin   },
  { id: "notifikasi", label: "Notifikasi",      icon: Bell     },
  { id: "keamanan",   label: "Keamanan",        icon: Shield   },
  { id: "tampilan",   label: "Tampilan",        icon: Palette  },
];

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState<Tab>("toko");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: "Bettasph",
    storeTagline: "Kurator Ikan Hias Premium Indonesia",
    storeUrl: "https://bettasph.com",
    whatsapp: "+6281234567890",
    telegram: "BettasphOfficial",
    email: "info@bettasph.com",
    address: "Jakarta Barat, Indonesia",
    instagram: "@bettasph_official",
    orderNotif: true,
    lowStockNotif: true,
    emailDigest: false,
    maintenanceMode: false,
    primaryColor: "#6366f1",
    darkMode: true,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof typeof settings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
  const labelClass = "block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5";

  if (loading) {
    return <div className="animate-pulse flex space-y-4 flex-col h-full opacity-50"><div className="h-10 bg-zinc-800 rounded w-1/4"></div><div className="h-[500px] bg-zinc-800 rounded w-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span><ChevronRight className="w-3 h-3" /><span className="text-zinc-300">Pengaturan</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Pengaturan</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Konfigurasi toko, kontak otomatis, dan preferensi widget sistem Anda.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.25)]"
          }`}
        >
          {saving ? <AlertCircle className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Tab Navigation */}
        <div className="w-44 flex-shrink-0 bg-[#11121f] border border-white/[0.06] rounded-2xl p-2 space-y-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? "text-indigo-400" : "text-zinc-600"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-[#11121f] border border-white/[0.06] rounded-2xl p-6 space-y-6">

          {/* ── INFORMASI TOKO ── */}
          {activeTab === "toko" && (
            <>
              <h2 className="text-sm font-bold text-zinc-200 border-b border-white/[0.04] pb-3">Informasi Toko</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nama Toko</label>
                  <input value={settings.storeName || ""} onChange={(e) => update("storeName", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input value={settings.storeTagline || ""} onChange={(e) => update("storeTagline", e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>URL Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input value={settings.storeUrl || ""} onChange={(e) => update("storeUrl", e.target.value)} className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── KONTAK & LOKASI ── */}
          {activeTab === "kontak" && (
            <>
              <h2 className="text-sm font-bold text-zinc-200 border-b border-white/[0.04] pb-3">Kontak & Widgets</h2>
              <p className="text-xs text-zinc-500 -mt-1">Pilih nomor dan username untuk dimunculkan pada widget Live Chat pelanggan.</p>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Nomor WhatsApp (628...)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input value={settings.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} className={`${inputClass} pl-10`} placeholder="6281234567890" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Username Telegram</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input value={settings.telegram || ""} onChange={(e) => update("telegram", e.target.value)} className={`${inputClass} pl-10`} placeholder="UsernameTanpaAt" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Instagram (@)</label>
                    <input value={settings.instagram || ""} onChange={(e) => update("instagram", e.target.value)} className={inputClass} placeholder="@bettasph" />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input value={settings.email || ""} onChange={(e) => update("email", e.target.value)} className={`${inputClass} pl-10`} placeholder="info@bettasph.com" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Alamat / Kota</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input value={settings.address || ""} onChange={(e) => update("address", e.target.value)} className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFIKASI ── */}
          {activeTab === "notifikasi" && (
            <>
              <h2 className="text-sm font-bold text-zinc-200 border-b border-white/[0.04] pb-3">Preferensi Notifikasi</h2>
              <div className="space-y-4">
                {[
                  { key: "orderNotif" as const, label: "Notifikasi Pesanan Baru", desc: "Tampilkan alert saat ada permintaan pembelian masuk." },
                  { key: "lowStockNotif" as const, label: "Peringatan Stok Hampir Habis", desc: "Notifikasi saat stok ikan di bawah 2 ekor." },
                  { key: "emailDigest" as const, label: "Ringkasan Email Mingguan", desc: "Terima laporan ringkas inventaris setiap Senin pagi." },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-200">{label}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => update(key, !settings[key])}
                      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${settings[key] ? "bg-indigo-600" : "bg-zinc-700"}`}
                      style={{ height: "22px", width: "40px" }}
                    >
                      <span
                        className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform`}
                        style={{
                          width: "18px",
                          height: "18px",
                          left: settings[key] ? "19px" : "2px",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── KEAMANAN ── */}
          {activeTab === "keamanan" && (
            <>
              <h2 className="text-sm font-bold text-zinc-200 border-b border-white/[0.04] pb-3">Keamanan & Akses</h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-200">Mode Maintenance</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Sembunyikan frontend dari pengunjung sementara situs dalam perbaikan.</p>
                  </div>
                  <button
                    onClick={() => update("maintenanceMode", !settings.maintenanceMode)}
                    className={`relative flex-shrink-0 rounded-full transition-colors`}
                    style={{ width: "40px", height: "22px", background: settings.maintenanceMode ? "#dc2626" : "#3f3f46" }}
                  >
                    <span
                      className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
                      style={{
                         width: "18px",
                         height: "18px",
                         left: settings.maintenanceMode ? "19px" : "2px",
                      }}
                    />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── TAMPILAN ── */}
          {activeTab === "tampilan" && (
            <>
              <h2 className="text-sm font-bold text-zinc-200 border-b border-white/[0.04] pb-3">Preferensi Tampilan</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Warna Aksen Utama Global</label>
                  <p className="text-xs text-zinc-500 mb-3">Ini akan mengubah warna logo, widget chat, dan elemen utama di Website pengunjung.</p>
                  <div className="flex items-center gap-3 mt-2">
                    {["#6366f1","#8b5cf6","#ec4899","#0ea5e9","#10b981","#f59e0b", "#20C997"].map((c) => (
                      <button
                        key={c}
                        onClick={() => update("primaryColor", c)}
                        className={`w-9 h-9 rounded-xl border-2 transition-all ${settings.primaryColor === c ? "border-white scale-110" : "border-transparent"}`}
                        style={{ background: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={settings.primaryColor || "#6366f1"}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer border-2 border-zinc-700 bg-zinc-900"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
