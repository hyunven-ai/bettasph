"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Fish, KeyRound, Mail, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/admin"; // Redirect ke dashboard sukses
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] pointer-events-none rounded-full"></div>
      
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
             <Fish className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-zinc-100 tracking-tight mb-2">Akses Sistem Ikanpedia.id</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">Otorisasi Khusus Kurator & Admin</p>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-3 text-sm">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="h-4 w-4" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="admin@ikanpedia.id.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Kata Sandi Rahasia</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <KeyRound className="h-4 w-4" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] mt-6 flex items-center justify-center"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Otentikasi Identitas"}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-zinc-600">
          Hanya Administrator terdaftar (di database Supabase) yang dapat mengakses portal ini.
        </p>
      </div>
    </div>
  );
}
