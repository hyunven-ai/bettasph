import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export const metadata = {
  title: 'Syarat & Ketentuan | Bettasph',
  description: 'Syarat dan Ketentuan layanan transaksi jual beli ikan premium di Bettasph.',
};

export default function SyaratKetentuanPage() {
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
              <BookOpen className="w-8 h-8 text-[var(--color-brand-aqua)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-outfit text-white">
              Syarat & Ketentuan
            </h1>
          </div>

          <div className="prose prose-slate prose-invert lg:prose-lg max-w-none text-slate-300 space-y-6">
            <p className="lead text-xl text-slate-400">
              Selamat datang di website Bettasph. Dengan melakukan akses, menelusuri, mendaftar, atau melakukan transaksi pembelian pada layanan online ini, Anda menyetujui, dan terikat dengan Syarat & Ketentuan berikut.
            </p>
            <p className="text-sm font-semibold italic">Terakhir Diperbarui: Oktober 2026</p>
            <hr className="border-white/10 my-8" />

            <h3 className="text-xl font-bold text-white mt-10">1. Kesesuaian Genetik Ikan (WYSIWYG)</h3>
            <p>
              Hampir 90% katalog foto/video di platform Bettasph menerapkan sistem <em>What You See Is What You Get</em>. Artinya ikan yang dikirim merupakan ikan yang tepat sesuai tertera pada foto/video produk tersebut. Namun, hal-hal berikut patut diperhatikan bahwa:
            </p>
            <ul className="list-disc pl-5">
              <li>Ikan adalah hewan mutasi genetik yang warnanya bisa saja menjadi lebih pekat saat sampai dibandingkan dengan saat video di ambil (terutama Cupang Marble/Koi/Avatar).</li>
              <li>Pencahayaan LED ketika photoshoot/video mungkin menyebabkan rona warna layar Anda dan warna asli dapat berbeda tipis (Deviasi wajar 5-10%).</li>
              <li>Kerusakan gen yang fatal di luar kewajaran mutasi, maka uang Anda dapat di-refund jika tidak sesuai (silakan konsultasi melalui Nomor WhatsApp kami).</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-10">2. Proses Pemesanan & Pembayaran</h3>
            <ul className="list-disc pl-5">
              <li>Toko berhak untuk mendahulukan pelanggan yang sudah melakukan transfer secara penuh, sistem berlaku siapa cepat dia dapat (First Pay, First Serve).</li>
              <li>Booking/Keep untuk reservasi di luar batas 1x24 Jam tidak diberlakukan kecuali disertai dengan Down Payment (DP) minimum 50%. DP tersebut berstatus hangus / non-refundable bila di-cancel kelak.</li>
              <li>Pihak Bettasph tidak memfasilitasi rekber selain yang tercantum atas Rekening Instansi milik platform / Payment Gateway kami di Checkout. Hati-hati terhadap penipuan mengatasnamakan brand Bettasph.</li>
            </ul>
            
            <h3 className="text-xl font-bold text-white mt-10">3. Ketentuan Pengembalian (Refunds) & Komplain</h3>
            <p>
              Harap merujuk ke halaman spesifik <Link href="/kebijakan-garansi" className="text-[var(--color-brand-aqua)] hover:underline">Kebijakan Garansi</Link> untuk detail tentang klaim Ikan Mati dalam pengiriman (D.O.A). Refund di luar konteks barang hidup, hanya berlaku apabila terdapat stok yang telah kosong di tempat kami pasca Anda melakukan transfer duluan, dana 100% akan dikembalikan hari itu juga.
            </p>

            <h3 className="text-xl font-bold text-white mt-10">4. Perubahan Kebijakan</h3>
            <p>
              Bettasph berhak secara sepihak dapat memperbarui, merevisi, mengubah Syarat dan Ketentuan, serta konten website kapan saja tanpa pemberitahuan mutlak terlebih dahulu kepada tiap pengguna. Disarankan meninjau kembali berkala halaman ini.
            </p>

          </div>
        </article>
      </div>
    </div>
  );
}
