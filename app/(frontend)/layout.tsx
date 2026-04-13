import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ambil data pengaturan situs untuk WhatsApp/Telegram
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('whatsapp, telegram, primarycolor')
    .limit(1)
    .single();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-[#20C997] selection:text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* Floating Senior UI WhatsApp Button */}
      <FloatingWhatsApp />
    </div>
  );
}
