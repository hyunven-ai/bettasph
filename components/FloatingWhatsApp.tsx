"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);

  // Show only after slightly scrolling to not overwhelm initial load
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.8,
        y: isVisible ? 0 : 20,
        pointerEvents: isVisible ? "auto" : "none" 
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex flex-col items-end gap-3"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-2xl opacity-0 hover:opacity-100 transition-opacity absolute right-16 bottom-2 w-max pointer-events-none sm:pointer-events-auto sm:opacity-100">
        Konsultasi via WhatsApp
      </div>
      
      <Link 
        href="https://wa.me/628999435054?text=Halo%20Ikanpedia.id,%20saya%20tertarik%20dengan%20koleksi%20ikan%20hias%20Anda."
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#25D366] to-[#128C7E] rounded-full shadow-[0_4px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_40px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all duration-300 group"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40"></span>
        <MessageCircle className="w-7 h-7 text-white relative z-10" />
      </Link>
    </motion.div>
  );
}
