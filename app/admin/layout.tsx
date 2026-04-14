"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  List,
  LogOut,
  Fish,
  Settings,
  BarChart2,
  Image as ImageIcon,
  Tag,
  ExternalLink,
  BookOpen,
  Search,
  PieChart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-800 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    return null;
  }

  const userEmail = session?.user?.email ?? "admin@ikanpedia.id.com";
  const userInitial = userEmail[0].toUpperCase();

  const menuSections = [
    {
      label: "MENU",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
        { name: "Koleksi Ikan", icon: Fish, href: "/admin/koleksi" },
        { name: "Tambah Koleksi", icon: PackagePlus, href: "/admin/tambah" },
      ],
    },
    {
      label: "KONTEN",
      items: [
        { name: "Blog & Artikel", icon: BookOpen, href: "/admin/blog" },
        { name: "Kategori & Tag", icon: Tag, href: "/admin/kategori" },
        { name: "Galeri Foto", icon: ImageIcon, href: "/admin/galeri" },
      ],
    },
    {
      label: "ANALITIK & SEO",
      items: [
        { name: "SEO Pages", icon: Search, href: "/admin/seo" },
        { name: "SEO Setting", icon: Settings, href: "/admin/seo-settings" },
        { name: "Analitik Koleksi", icon: PieChart, href: "/admin/analitik" },
      ],
    },
    {
      label: "SISTEM",
      items: [
        { name: "Pengaturan", icon: Settings, href: "/admin/pengaturan" },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#0d0e1a] text-zinc-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0d0e1a] border-r border-white/[0.06] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Fish className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">Ikanpedia.id</span>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {menuSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2">
                {section.label}
              </p>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] font-medium"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-600"}`} />
                      {item.name}
                      {isActive && (
                        <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User & Logout */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] text-zinc-300 font-medium truncate">Admin</p>
              <p className="text-[10px] text-zinc-600 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-2.5 px-2.5 py-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/[0.07] rounded-lg text-[13px] font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-end px-6 flex-shrink-0 bg-[#0d0e1a]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Site
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
