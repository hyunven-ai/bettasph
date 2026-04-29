import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// AI Rekomendasi Ikan — Rule-based Engine (Tier 3)
// Bisa diupgrade ke Gemini API dengan mengganti bagian generateRec()
// ============================================================

interface FishProfile {
  name: string;
  species: string;
  category: string;
  priceMin: number;
  priceMax: number;
  difficulty: 'pemula' | 'menengah' | 'expert';
  purposes: string[];
  tankSizeMin: number; // cm
  characteristics: string[];
  careNotes: string;
  investmentValue: 'rendah' | 'sedang' | 'tinggi';
}

// Database ikan lokal — bisa diperluas atau dipindah ke Supabase
const FISH_DATABASE: FishProfile[] = [
  {
    name: 'Betta Halfmoon',
    species: 'Betta splendens',
    category: 'betta',
    priceMin: 50000, priceMax: 500000,
    difficulty: 'pemula',
    purposes: ['hobi', 'kontes'],
    tankSizeMin: 20,
    characteristics: ['warna cerah', 'ekor lebar', 'mudah dirawat', 'solo tank'],
    careNotes: 'Jangan campur dengan sesama jantan. Ganti air 30% tiap minggu.',
    investmentValue: 'sedang',
  },
  {
    name: 'Betta Galaxy',
    species: 'Betta splendens',
    category: 'betta',
    priceMin: 150000, priceMax: 2000000,
    difficulty: 'menengah',
    purposes: ['kontes', 'investasi'],
    tankSizeMin: 20,
    characteristics: ['warna premium', 'pola galaxy', 'nilai tinggi', 'rare'],
    careNotes: 'Butuh air berkualitas tinggi, suhu stabil 26-28°C.',
    investmentValue: 'tinggi',
  },
  {
    name: 'Guppy Fancy',
    species: 'Poecilia reticulata',
    category: 'guppy',
    priceMin: 20000, priceMax: 200000,
    difficulty: 'pemula',
    purposes: ['hobi', 'breeding'],
    tankSizeMin: 30,
    characteristics: ['warna cerah', 'mudah berkembang biak', 'komunal', 'aktif'],
    careNotes: 'Cocok untuk aquascape. Bisa campur dengan ikan damai lain.',
    investmentValue: 'rendah',
  },
  {
    name: 'Koi Kohaku',
    species: 'Cyprinus rubrofuscus',
    category: 'koi',
    priceMin: 200000, priceMax: 5000000,
    difficulty: 'menengah',
    purposes: ['hobi', 'kontes', 'investasi'],
    tankSizeMin: 100,
    characteristics: ['merah putih', 'kolam outdoor', 'panjang umur', 'koi klasik'],
    careNotes: 'Butuh kolam min 500L. Filter kuat wajib. Bisa hidup 25+ tahun.',
    investmentValue: 'tinggi',
  },
  {
    name: 'Koi Showa',
    species: 'Cyprinus rubrofuscus',
    category: 'koi',
    priceMin: 500000, priceMax: 15000000,
    difficulty: 'expert',
    purposes: ['kontes', 'investasi'],
    tankSizeMin: 150,
    characteristics: ['tiga warna', 'premium', 'kontes level', 'rare pattern'],
    careNotes: 'Butuh air berkualitas sangat baik dan kolam luas min 2000L.',
    investmentValue: 'tinggi',
  },
  {
    name: 'Arwana Silver',
    species: 'Osteoglossum bicirrhosum',
    category: 'arwana',
    priceMin: 500000, priceMax: 3000000,
    difficulty: 'menengah',
    purposes: ['hobi', 'investasi'],
    tankSizeMin: 150,
    characteristics: ['predator', 'megah', 'jumbo', 'simbol kemakmuran'],
    careNotes: 'Tank min 300cm. Makanan hidup atau pelet premium. Jangan campur ikan kecil.',
    investmentValue: 'tinggi',
  },
  {
    name: 'Arwana Super Red',
    species: 'Scleropages formosus',
    category: 'arwana',
    priceMin: 5000000, priceMax: 100000000,
    difficulty: 'expert',
    purposes: ['investasi', 'kontes'],
    tankSizeMin: 200,
    characteristics: ['merah pekat', 'sangat mahal', 'dilindungi CITES', 'investasi tinggi'],
    careNotes: 'Butuh sertifikat CITES. Tank khusus, pencahayaan premium. Air harus sempurna.',
    investmentValue: 'tinggi',
  },
  {
    name: 'Neon Tetra',
    species: 'Paracheirodon innesi',
    category: 'other',
    priceMin: 5000, priceMax: 30000,
    difficulty: 'pemula',
    purposes: ['hobi', 'aquascape'],
    tankSizeMin: 40,
    characteristics: ['komunal', 'biru merah', 'schooling fish', 'harga terjangkau'],
    careNotes: 'Pelihara min 10 ekor. Cocok dengan ikan damai. pH 6.0-7.0.',
    investmentValue: 'rendah',
  },
  {
    name: 'Discus',
    species: 'Symphysodon sp.',
    category: 'other',
    priceMin: 200000, priceMax: 2000000,
    difficulty: 'expert',
    purposes: ['hobi', 'kontes'],
    tankSizeMin: 80,
    characteristics: ['bulat pipih', 'warna indah', 'sensitif', 'premium freshwater'],
    careNotes: 'Suhu tinggi 28-32°C. Air lunak, pH 6.0-6.5. Perawatan ketat.',
    investmentValue: 'sedang',
  },
  {
    name: 'Louhan',
    species: 'Hybrid cichlid',
    category: 'other',
    priceMin: 100000, priceMax: 5000000,
    difficulty: 'menengah',
    purposes: ['hobi', 'feng shui'],
    tankSizeMin: 100,
    characteristics: ['nonong besar', 'warna cerah', 'interaktif', 'agresif'],
    careNotes: 'Solo tank atau pasang. Ganti air 50% tiap minggu. Suka interaksi dengan pemilik.',
    investmentValue: 'sedang',
  },
];

function scoreRecommendation(
  fish: FishProfile,
  budget: number,
  experience: string,
  purpose: string,
  tankSize: number,
  prefs: string[]
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // --- Budget match (bobot 35%) ---
  if (budget >= fish.priceMin && budget <= fish.priceMax) {
    score += 35;
    reasons.push(`Sesuai budget Rp ${fish.priceMin.toLocaleString('id-ID')} – Rp ${fish.priceMax.toLocaleString('id-ID')}`);
  } else if (budget > fish.priceMax) {
    score += 20;
    reasons.push('Budget kamu lebih dari cukup');
  } else if (budget >= fish.priceMin * 0.7) {
    score += 15;
    reasons.push('Hampir sesuai budget, cek harga awal lelang');
  }

  // --- Experience match (bobot 25%) ---
  const expMap: Record<string, number> = { pemula: 1, menengah: 2, expert: 3 };
  const userLevel = expMap[experience] || 1;
  const fishLevel = expMap[fish.difficulty] || 1;

  if (fishLevel <= userLevel) {
    score += 25;
    if (fishLevel === userLevel) reasons.push(`Cocok untuk level ${experience}`);
    else reasons.push('Mudah dirawat untuk level kamu');
  } else if (fishLevel === userLevel + 1) {
    score += 10;
    reasons.push('Sedikit menantang, bagus untuk naik level');
  }

  // --- Purpose match (bobot 25%) ---
  if (fish.purposes.includes(purpose)) {
    score += 25;
    reasons.push(`Ideal untuk tujuan ${purpose}`);
  } else if (purpose === 'hobi' && fish.purposes.length > 0) {
    score += 10;
    reasons.push('Bisa dipelihara untuk hobi');
  }

  // --- Tank size (bobot 10%) ---
  if (tankSize >= fish.tankSizeMin) {
    score += 10;
    if (fish.tankSizeMin <= 30) reasons.push('Cocok untuk aquarium kecil');
    else if (fish.tankSizeMin <= 80) reasons.push(`Butuh aquarium min ${fish.tankSizeMin}cm`);
    else reasons.push(`Butuh kolam/tank besar min ${fish.tankSizeMin}cm`);
  } else {
    score -= 15;
    reasons.push(`⚠️ Butuh tank min ${fish.tankSizeMin}cm (kamu: ${tankSize}cm)`);
  }

  // --- Preference bonus (tiap match +5) ---
  if (prefs.length > 0) {
    const matchedPrefs = prefs.filter((p) =>
      fish.characteristics.some((c) => c.toLowerCase().includes(p.toLowerCase()))
    );
    score += matchedPrefs.length * 5;
    if (matchedPrefs.length > 0) {
      reasons.push(`Sesuai preferensi: ${matchedPrefs.join(', ')}`);
    }
  }

  return { score: Math.max(0, score), reasons };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    budget = 500000,
    experience = 'pemula',
    purpose = 'hobi',
    tank_size = 60,
    preferences = [],
    category,
  } = body;

  // Score semua ikan
  const scored = FISH_DATABASE
    .filter((f) => !category || f.category === category)
    .map((fish) => {
      const { score, reasons } = scoreRecommendation(
        fish, budget, experience, purpose, tank_size, preferences
      );
      return { fish, score, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (scored.length === 0) {
    return NextResponse.json({
      recommendations: [],
      tip: 'Tidak ada rekomendasi yang cocok. Coba perbesar budget atau ubah ukuran tank.',
    });
  }

  // Format response
  const recommendations = scored.map(({ fish, score, reasons }, i) => ({
    rank: i + 1,
    name: fish.name,
    species: fish.species,
    category: fish.category,
    price_range: {
      min: fish.priceMin,
      max: fish.priceMax,
      label: `Rp ${fish.priceMin.toLocaleString('id-ID')} – Rp ${fish.priceMax.toLocaleString('id-ID')}`,
    },
    difficulty: fish.difficulty,
    investment_value: fish.investmentValue,
    match_score: score,
    reasons,
    care_notes: fish.careNotes,
    characteristics: fish.characteristics,
  }));

  // Generate tip berdasarkan input
  let tip = '';
  if (experience === 'pemula' && budget > 1000000) {
    tip = '💡 Sebagai pemula, mulai dengan Betta atau Guppy dulu. Hemat budget untuk upgrade setup nanti.';
  } else if (purpose === 'investasi') {
    tip = '💡 Untuk investasi, pilih ikan dengan grade tinggi dan dokumentasi lengkap (foto, video kondisi).';
  } else if (tank_size < 50) {
    tip = '💡 Tank kamu cukup kecil. Betta atau Neon Tetra adalah pilihan terbaik.';
  } else if (purpose === 'kontes') {
    tip = '💡 Untuk kontes, prioritaskan grade S+ dengan symmetry sirip sempurna dan warna solid.';
  } else {
    tip = '💡 Pastikan cek kondisi ikan via foto/video sebelum bid. Tanya seller jika ada yang kurang jelas.';
  }

  return NextResponse.json({ recommendations, tip, total_analyzed: FISH_DATABASE.length });
}
