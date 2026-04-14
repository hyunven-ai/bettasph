"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Fish } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [whatsapp, setWhatsapp] = useState("628999435054");
  const pathname = usePathname();

  const cartItems = useCartStore((state) => state.items);
  const totalCart = useCartStore((state) => state.getTotal());
  const removeFromCart = useCartStore((state) => state.removeItem);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Ambil nomor WA dari setting (Supabase)
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.whatsapp) {
          setWhatsapp(data.whatsapp.replace(/\D/g, ''));
        }
      })
      .catch(() => { });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);
  };

  const handleCheckoutWA = () => {
    let message = "Halo Ikanpedia.id! Saya ingin memesan produk premium berikut:%0A%0A";
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.quantity}x) - ${formatPrice(item.price * item.quantity)}%0A`;
    });
    message += `%0A*Total: ${formatPrice(totalCart)}*%0A%0AMohon konfirmasi ketersediaan. Terima kasih.`;
    window.open(`https://wa.me/${whatsapp}?text=${message}`);
  };

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Katalog Eksklusif", href: "/ikan" },
    { name: "Library Edukasi", href: "/blog" },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-40 transition-all duration-300 ${hasScrolled
            ? "bg-[#050810]/80 backdrop-blur-lg border-b border-white/10 py-3 shadow-lg"
            : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group text-white">
              <div className="p-2 bg-[var(--color-brand-aqua)] rounded-xl group-hover:shadow-glow transition-all duration-300">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <span className="font-outfit font-bold text-2xl tracking-tight transition-colors text-white">
                Ikanpedia<span className="text-[var(--color-brand-aqua)]">.id</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center bg-white/5 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                        ? "bg-white text-[var(--color-brand-navy)] shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            {/* Cart Button */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center p-3 rounded-full transition-all duration-300 bg-white/10 text-white hover:bg-white/20"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-transparent">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full transition-colors bg-white/10 text-white"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg transition-colors text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Expanded */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl overflow-hidden">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-3 text-base font-semibold text-slate-800 hover:text-[var(--color-brand-aqua)] hover:bg-slate-50 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Slide-over Cart Panel */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
        <div className={`absolute inset-y-0 right-0 max-w-full flex transition-transform duration-500 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="w-screen max-w-md w-full bg-white shadow-2xl flex flex-col h-full rounded-l-[2rem] overflow-hidden">

            {/* Header Keranjang */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100 bg-white">
              <h2 className="text-2xl font-outfit font-bold text-[var(--color-brand-navy)] flex items-center gap-2">
                Keranjang Belanja <span className="text-sm font-medium px-2.5 py-0.5 bg-slate-100 rounded-full">{totalItems} item</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List Item Keranjang */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-lg font-medium">Keranjang masih kosong</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-[var(--color-brand-aqua)] font-semibold hover:underline">Mulai Eksplorasi</button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-[var(--color-brand-navy)] line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-[var(--color-brand-aqua)] font-semibold mt-1">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-slate-500 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">Qty: {item.quantity}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                            Hapus
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fotter Keranjang & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-100 bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-slate-500 font-medium">Subtotal</p>
                  <p className="text-2xl font-bold text-[var(--color-brand-navy)]">{formatPrice(totalCart)}</p>
                </div>
                <button
                  onClick={handleCheckoutWA}
                  className="w-full relative overflow-hidden group bg-[var(--color-brand-aqua)] text-white font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-2 transition-all hover:bg-[#19b285] hover:shadow-glow-strong"
                >
                  <span className="relative z-10 flex items-center gap-2">Pesan via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
