import Link from "next/link";
import { Fish } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Footer() {
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  const waDisplay = settings?.whatsapp || "+62 812-3456-7890";
  const addressDisplay = settings?.address || "Jakarta Barat, Indonesia";
  const storeTagline = settings?.storeTagline || "Kurator ikan hias eksklusif Nusantara. Kami mendedikasikan diri untuk menyediakan mahakarya genetik terbaik dengan standar karantina profesional, langsung ke tangan Anda.";

  return (
    <footer className="bg-[#050810] text-slate-400 border-t border-white/5 relative overflow-hidden">
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[800px] h-[300px] bg-[var(--color-brand-navy)] opacity-50 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">

          <div className="md:col-span-5 pr-8">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-[var(--color-brand-aqua)]/20 transition-colors">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <span className="font-outfit font-bold text-2xl text-white tracking-tight">Ikanpedia<span className="text-[var(--color-brand-aqua)]">.id</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-sm">
              {storeTagline}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-white font-outfit font-semibold mb-6 tracking-wide text-sm uppercase">Navigasi Utama</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-[var(--color-brand-aqua)] transition-colors">Beranda</Link></li>
              <li><Link href="/ikan" className="hover:text-[var(--color-brand-aqua)] transition-colors">Galeri Etalase</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--color-brand-aqua)] transition-colors">Jurnal & Edukasi</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-white font-outfit font-semibold mb-6 tracking-wide text-sm uppercase">Informasi</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/kebijakan-garansi" className="hover:text-white transition-colors">Kebijakan Garansi</Link></li>
              <li><Link href="/sistem-pengiriman" className="hover:text-white transition-colors">Sistem Pengiriman</Link></li>
              <li><Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-white font-outfit font-semibold mb-6 tracking-wide text-sm uppercase">Hotline Pelayanan</h3>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-xs text-slate-500 mb-1">WhatsApp Official</p>
                <p className="text-white font-medium">{waDisplay}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-xs text-slate-500 mb-1">Markas Utama</p>
                <p className="text-white font-medium">{addressDisplay}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-16 pt-8 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Ikanpedia.id All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Server Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
