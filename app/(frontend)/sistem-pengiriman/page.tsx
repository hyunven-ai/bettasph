import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

export const metadata = {
  title: 'Sistem Pengiriman | Ikanpedia.id',
  description: 'Metode packing karantina dan prosedur pengiriman ikan hidup di seluruh Indonesia.',
};

export default function SistemPengirimanPage() {
  return (
    <div className="bg-[#050810] min-h-screen pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-[var(--color-brand-aqua)] mb-10 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </Link>
        <article className="bg-[#0A0F1C] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-aqua)]/10 blur-[50px] rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[var(--color-brand-aqua)]/10 border border-[var(--color-brand-aqua)]/20 rounded-2xl">
              <Truck className="w-8 h-8 text-[var(--color-brand-aqua)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-outfit text-white">
              Sistem Pengiriman
            </h1>
          </div>

          <div className="prose prose-slate prose-invert lg:prose-lg max-w-none text-slate-300 space-y-6">
            <p className="lead text-xl text-slate-400">
              Setiap ikan yang Anda beli di Ikanpedia.id telah melalui SOP Karantina ketat sebelum diberangkatkan guna memastikan kelayakan di perjalanan.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10">Proses Sebelum Pengiriman (Karantina)</h2>
            <p>
              Ikan tidak langsung dikirim pada hari/jam yang sama saat Anda memesan. Ikan wajib menjalani proses <strong>Karantina dan Puasa</strong> selama minimal 24 - 48 Jam (tergantung ukuran dan jenis ikan). 
            </p>
            <p>Hal ini bertujuan untuk: <br/>
              - Mengosongkan lambung agar air tidak tercemar feses dan amonia selama perjalanan.<br/>
              - Memberikan waktu agar ikan menjadi tenang sebelum dikemas.<br/>
              Oleh karena itu, pengiriman nomor resi mungkin memerlukan waktu hingga H+2 dari tanggal pemesanan.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10">Standar Packing & Pengemasan</h2>
            <ul className="space-y-3 p-0 list-none">
              <li className="flex items-start gap-4">
                <span className="text-blue-400 mt-1">🔹</span>
                <span><strong>Plastik Double Layer / Tembus Jarum.</strong> Kami menggunakan plastik khusus ikan yang sangat tebal berlapis dua kali (plus dilakban membulat di sudut) agar ikan tidak menyangkut atau bocor.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-blue-400 mt-1">🔹</span>
                <span><strong>Komposisi Nitrogen / Oksigen Murni.</strong> Perbandingan antara air murni mutlak + obat methlyne blue dan Oksigen (O2) murni disetting sebesar 30% Air : 70% Oksigen sehingga ikan bertahan hingga 5 hari di jalan.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-blue-400 mt-1">🔹</span>
                <span><strong>Box Styrofoam (Opsional/Wajib untuk Luar Jawa).</strong> Pengiriman akan dilapisi buble wrap, kardus tebal khusus, atau Box Sterofoam agar suhu dalam paket tetap teduh di segala musim.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10">Ekspedisi & Jangkauan Pengiriman</h2>
            <p>
              Kami bermitra dengan J&T Express, TIKI, Paxel, dan Kereta Api (KAI/KIB) khusus pengambilan langsung di Stasiun terdekat untuk memastikan hewan hidup ditangani semestinya. 
            </p>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mt-4">
              <p className="text-sm text-yellow-500 font-semibold mb-1">Catatan Penting Pengiriman Luar Pulau Jawa</p>
              <p className="text-sm text-slate-400">Pengiriman Luar Pulau Jawa membutuhkan Sertifikat Karantina Mandat Pemerintah. Pembuatan surat mengonsumsi waktu 1-2 hari kerja dan ada sedikit biaya bea karantina. Estimasi kedatangan berkisar 2-5 Hari.</p>
            </div>
            
          </div>
        </article>
      </div>
    </div>
  );
}
