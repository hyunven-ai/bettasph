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
      <div className="h-full bg-[#0B1120] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[var(--color-brand-aqua)]/40 transition-all duration-500 ease-senior flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-black/90 before:z-10 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        
        {/* Glow behind image on hover */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--color-brand-aqua)] rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>

        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#050810]">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-senior"
          />
          <div className="absolute top-6 left-6 z-20 px-3.5 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-extrabold text-[var(--color-brand-aqua)] uppercase tracking-[0.2em] border border-white/10">
            {product.category}
          </div>
          <div className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4">
             <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="p-8 relative z-20 flex-1 flex flex-col justify-end mt-auto -mt-24 pointer-events-none">
          <div className="mb-4">
            <h3 className="font-outfit text-2xl font-bold text-white group-hover:text-[var(--color-brand-aqua)] transition-colors leading-tight tracking-tight">{product.name}</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">Size {product.size} — Premium Grade</p>
          </div>
          
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 pointer-events-auto">
             <div className="flex flex-col">
               <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em] font-bold mb-1 opacity-60">Price Guide</span>
               <span className="font-outfit font-black text-white text-xl tracking-tight">{formatPrice(product.price)}</span>
             </div>
             <button 
                onClick={handleAddToCart}
                className="w-12 h-12 bg-[var(--color-brand-aqua)] hover:bg-[#1bb888] shadow-glow flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-90"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#0B1120] stroke-[2.5px]" />
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
