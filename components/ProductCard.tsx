"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

export interface FishProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  size: string;
  imageUrl: string;
  slug: string;
}

export default function ProductCard({ product }: { product: FishProduct }) {
  const addToCart = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Link href={`/ikan/${product.slug}`} className="group block h-full">
      <div className="h-full bg-[#0f172a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--color-brand-aqua)]/50 transition-colors duration-500 flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-black/80 before:z-10">
        
        {/* Glow behind image on hover */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--color-brand-aqua)] rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"></div>

        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0A0F1C]">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
          />
          <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold text-[var(--color-brand-aqua)] uppercase tracking-widest border border-white/10">
            {product.category}
          </div>
          <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="p-6 relative z-20 flex-1 flex flex-col justify-end mt-auto -mt-20">
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-outfit text-xl font-bold text-white group-hover:text-[var(--color-brand-aqua)] transition-colors leading-tight">{product.name}</h3>
          </div>
          
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3">
             <div className="flex flex-col">
               <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Estimasi</span>
               <span className="font-outfit font-bold text-white text-lg">{formatPrice(product.price)}</span>
             </div>
             <button 
                onClick={handleAddToCart}
                className="w-10 h-10 bg-[var(--color-brand-aqua)] hover:bg-[#1bb888] shadow-glow flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#0B1120]" />
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
