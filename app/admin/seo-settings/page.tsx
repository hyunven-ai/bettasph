"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Settings,
  ChevronRight,
  Save,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Share2,
  Code,
  Shield,
  FileText,
  MousePointer2,
  Loader2
} from "lucide-react";

type SeoTab = "general" | "meta" | "technical" | "analytics";

const SEO_TABS: { id: SeoTab; label: string; icon: React.ElementType }[] = [
  { id: "general",   label: "General Settings",   icon: Globe },
  { id: "meta",      label: "Default Meta Tags",  icon: Share2 },
  { id: "technical", label: "Technical SEO",      icon: Code },
  { id: "analytics", label: "Tracking & Analytics", icon: BarChart2 },
];

export default function AdminSeoSettingsPage() {
  const [activeTab, setActiveTab] = useState<SeoTab>("general");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state (initialized with same structure as /api/settings)
  const [settings, setSettings] = useState<any>({
    seoTitleTemplate: "%title% | %site_name%",
    seoDescription: "",
    seoSiteName: "Ikanpedia.id",
    seoOgImage: "",
    seoTwitterHandle: "",
    seoRobotsTxt: "User-agent: *\nAllow: /",
    seoSitemapUrl: "",
    seoCanonicalBase: "https://ikanpedia.id.com",
    analyticsGaId: "",
    analyticsFbPixel: "",
    analyticsTiktokPixel: "",
    analyticsGtmId: ""
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: any) =>
    setSettings((prev: any) => ({ ...prev, [key]: value }));

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
        alert("Gagal menyimpan pengaturan SEO.");
      }
    } catch (err) {
       alert("Error: " + err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
  const labelClass = "block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5";
  const helperClass = "text-[10px] text-zinc-600 mt-1.5 leading-relaxed";

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-zinc-800 rounded w-1/4" />
        <div className="flex gap-6">
           <div className="w-44 h-48 bg-zinc-800 rounded-2xl" />
           <div className="flex-1 h-[600px] bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <span>Admin</span><ChevronRight className="w-3 h-3" /><span className="text-zinc-300">SEO Setting</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">SEO Setting</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Optimasi visibilitas mesin pencari dan integrasi analitik pemasaran.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.25)]"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Tersimpan!" : saving ? "Saving..." : "Save SEO Settings"}
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Tab Navigation */}
        <div className="w-48 flex-shrink-0 bg-[#11121f] border border-white/[0.06] rounded-2xl p-2.5 space-y-1">
          {SEO_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? "text-white" : "text-zinc-600"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-[#11121f] border border-white/[0.06] rounded-2xl p-8 min-h-[500px]">
          
          {/* ────── GENERAL SETTINGS ────── */}
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4 mb-6">
                 <div className="p-2 bg-indigo-500/10 rounded-lg"><Globe className="w-5 h-5 text-indigo-400" /></div>
                 <div>
                    <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">General SEO</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Konfigurasi dasar bagaimana situs Anda muncul di hasil pencarian.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={labelClass}>Site Name (for SEO)</label>
                  <input 
                    value={settings.seoSiteName} 
                    onChange={(e) => update("seoSiteName", e.target.value)} 
                    className={inputClass} 
                    placeholder="Contoh: Ikanpedia.id" 
                  />
                  <p className={helperClass}>Nama murni situs Anda untuk skema Rich Snippets.</p>
                </div>

                <div>
                  <label className={labelClass}>Global Title Template</label>
                  <input 
                    value={settings.seoTitleTemplate} 
                    onChange={(e) => update("seoTitleTemplate", e.target.value)} 
                    className={inputClass} 
                    placeholder="%title% | %site_name%" 
                  />
                  <p className={helperClass}>Gunakan variabel <code className="text-indigo-400">%title%</code> untuk judul halaman dan <code className="text-indigo-400">%site_name%</code> untuk nama situs.</p>
                </div>

                <div>
                  <label className={labelClass}>Default Meta Description</label>
                  <textarea 
                    value={settings.seoDescription} 
                    onChange={(e) => update("seoDescription", e.target.value)} 
                    rows={4} 
                    className={`${inputClass} resize-none`} 
                    placeholder="Deskripsi fallback jika deskripsi halaman kosong..." 
                  />
                  <p className={helperClass}>Gunakan 150-160 karakter untuk hasil optimal di Google.</p>
                </div>
              </div>
            </div>
          )}

          {/* ────── DEFAULT META TAGS ────── */}
          {activeTab === "meta" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4 mb-6">
                 <div className="p-2 bg-indigo-500/10 rounded-lg"><Share2 className="w-5 h-5 text-indigo-400" /></div>
                 <div>
                    <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">Social Media & Meta</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Mengatur bagaimana link situs Anda terlihat saat dibagikan ke media sosial.</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Default OG Image URL</label>
                  <div className="flex gap-3">
                     <input 
                        value={settings.seoOgImage} 
                        onChange={(e) => update("seoOgImage", e.target.value)} 
                        className={inputClass} 
                        placeholder="https://example.com/share-banner.jpg" 
                      />
                  </div>
                  <p className={helperClass}>Rekomendasi ukuran: 1200x630px. Muncul saat link dibagikan di WA, FB, dll.</p>
                </div>

                <div>
                  <label className={labelClass}>Twitter Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">@</span>
                    <input 
                      value={settings.seoTwitterHandle} 
                      onChange={(e) => update("seoTwitterHandle", e.target.value)} 
                      className={`${inputClass} pl-8`} 
                      placeholder="username" 
                    />
                  </div>
                  <p className={helperClass}>Digunakan untuk meta tag 'twitter:site'.</p>
                </div>
              </div>
            </div>
          )}

          {/* ────── TECHNICAL SEO ────── */}
          {activeTab === "technical" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4 mb-6">
                 <div className="p-2 bg-indigo-500/10 rounded-lg"><Code className="w-5 h-5 text-indigo-400" /></div>
                 <div>
                    <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">Technical & Crawling</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Konfigurasi file robot dan indeksasi tingkat lanjut.</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                   <label className={labelClass}>Robots.txt Content</label>
                   <textarea 
                      value={settings.seoRobotsTxt} 
                      onChange={(e) => update("seoRobotsTxt", e.target.value)} 
                      rows={6} 
                      className={`${inputClass} font-mono text-[13px] leading-6`} 
                      spellCheck={false}
                   />
                   <p className={helperClass}>File ini memberitahu bot pencari halaman mana yang boleh dirayapi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className={labelClass}>Sitemap URL</label>
                      <input 
                         value={settings.seoSitemapUrl} 
                         onChange={(e) => update("seoSitemapUrl", e.target.value)} 
                         className={inputClass} 
                         placeholder="/sitemap.xml" 
                      />
                   </div>
                   <div>
                      <label className={labelClass}>Canonical Base URL</label>
                      <input 
                         value={settings.seoCanonicalBase} 
                         onChange={(e) => update("seoCanonicalBase", e.target.value)} 
                         className={inputClass} 
                         placeholder="https://ikanpedia.id" 
                      />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ────── ANALYTICS ────── */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4 mb-6">
                 <div className="p-2 bg-indigo-500/10 rounded-lg"><BarChart2 className="w-5 h-5 text-indigo-400" /></div>
                 <div>
                    <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">Tracking & Pixels</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Integrasikan alat analisis untuk memantau performa pengunjung.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                   <div>
                      <label className={labelClass}>Google Analytics 4 ID</label>
                      <input 
                         value={settings.analyticsGaId} 
                         onChange={(e) => update("analyticsGaId", e.target.value)} 
                         className={inputClass} 
                         placeholder="G-XXXXXXXXXX" 
                      />
                      <p className={helperClass}>Gunakan Measurement ID dari dashboard Google Analytics.</p>
                   </div>
                   <div>
                      <label className={labelClass}>Google Tag Manager (GTM) ID</label>
                      <input 
                         value={settings.analyticsGtmId} 
                         onChange={(e) => update("analyticsGtmId", e.target.value)} 
                         className={inputClass} 
                         placeholder="GTM-XXXXXXX" 
                      />
                   </div>
                </div>

                <div className="space-y-5">
                   <div>
                      <label className={labelClass}>Facebook Pixel ID</label>
                      <input 
                         value={settings.analyticsFbPixel} 
                         onChange={(e) => update("analyticsFbPixel", e.target.value)} 
                         className={inputClass} 
                         placeholder="ID Angka 15-16 digit" 
                      />
                      <p className={helperClass}>Penting untuk pemasaran ulang FB Ads.</p>
                   </div>
                   <div>
                      <label className={labelClass}>TikTok Pixel ID</label>
                      <input 
                         value={settings.analyticsTiktokPixel} 
                         onChange={(e) => update("analyticsTiktokPixel", e.target.value)} 
                         className={inputClass} 
                         placeholder="ID Pixel TikTok" 
                      />
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
