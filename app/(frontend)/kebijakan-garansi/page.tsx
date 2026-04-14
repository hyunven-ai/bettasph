import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: 'Kebijakan Garansi (D.O.A) | Ikanpedia.id',
  description: 'Prosedur dan syarat klaim garansi ikan hias Death on Arrival (DOA) di Ikanpedia.id.',
};

export default function KebijakanGaransiPage() {
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
              <ShieldCheck className="w-8 h-8 text-[var(--color-brand-aqua)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-outfit text-white">
              Kebijakan Garansi
            </h1>
          </div>

          <div className="prose prose-slate prose-invert lg:prose-lg max-w-none text-slate-300 space-y-6">
            <p className="lead text-xl text-slate-400">
              Kepuasan dan kenyamanan Anda adalah prioritas kami. Kami memberikan jaminan <strong>Death On Arrival (D.O.A)</strong> untuk setiap pembelian ikan hias di Ikanpedia.id.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10">Syarat Klaim Garansi 100%</h2>
            <ul className="space-y-3 p-0 list-none">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">1</span>
                <span><strong>Video Unboxing Tanpa Jeda (No Edit/Cut).</strong> Anda diwajibkan merekam proses pembukaan paket mulai dari kondisi paket masih utuh / belum terbuka bungkus luarnya, hingga ikan terlihat di dalam plastiknya (tidak harus dikeluarkan dari plastik).</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">2</span>
                <span><strong>Ikan Mati Dalam Plastik Bawaan.</strong> Garansi hanya berlaku jika ikan mati di dalam kemasan plastik atau saat pertama kali plastik dibuka. Bila ikan sudah dimasukkan ke dalam akuarium Anda atau wadah lain, garansi D.O.A otomatis gugur.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">3</span>
                <span><strong>Batas Waktu Laporan.</strong> Anda wajib melaporkan status D.O.A kepada Customer Service kami (melalui WhatsApp) maksimal <strong>2 jam</strong> setelah paket dinyatakan "Terkirim/Delivered" oleh sistem pelacakan ekspedisi.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10">Mekanisme Pergantian Ikan</h2>
            <p>Jika klaim garansi Anda valid sesuai persyaratan di atas, Anda dapat memilih dua opsi:</p>
            <ol className="pl-6 space-y-3 list-decimal marker:text-blue-400 marker:font-bold">
              <li>Mendapatkan ikan ganti dengan tipe/genetik yang setara nilainya (ongkos kirim ikan pengganti ditanggung pembeli).</li>
              <li>Mendapatkan pengembalian dana (Refund) senilai harga ikan saja (biaya packing dan ongkos kirim tidak termasuk).</li>
            </ol>

            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl mt-8">
              <p className="text-sm text-red-200 mt-0 font-medium">Garansi TIDAK Berlaku apabila:</p>
              <ul className="text-sm text-slate-400 mt-2 space-y-2 list-disc pl-5">
                <li>Ikan mati akibat keterlambatan pihak ekspedisi lebih dari estimasi waktu maksimal pengiriman.</li>
                <li>Mati saat proses aklimatisasi (penyesuaian suhu) yang salah di rumah Anda.</li>
                <li>Lompat dari wadah, atau kesalahan perawatan setelah barang dinyatakan selamat.</li>
                <li>Memberikan ulasan negatif / rating sepihak sebelum diskusi klaim selesai dilakukan.</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
