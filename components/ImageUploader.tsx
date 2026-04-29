"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload, X, ImageIcon, Loader2, AlertCircle, Link2, Plus, CheckCircle2,
} from "lucide-react";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  preview: string;
  progress: "uploading" | "done" | "error";
  error?: string;
}

type InputMode = "upload" | "url";

export default function ImageUploader({
  value = [],
  onChange,
  maxFiles = 6,
  folder = "auctions",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<InputMode>("upload");

  // URL input state
  const [urlInput, setUrlInput] = useState("");
  const [urlState, setUrlState] = useState<"idle" | "checking" | "valid" | "error">("idle");
  const [urlError, setUrlError] = useState("");

  // ── Upload file ke Supabase Storage ─────────────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload gagal");
    return data.url;
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const remaining = maxFiles - value.length;
      const toUpload = fileArr.slice(0, remaining);
      if (toUpload.length === 0) return;

      const entries: UploadingFile[] = toUpload.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        preview: URL.createObjectURL(f),
        progress: "uploading",
      }));
      setUploading((prev) => [...prev, ...entries]);

      const results = await Promise.allSettled(
        toUpload.map((file, i) => uploadFile(file).then((url) => ({ url, id: entries[i].id })))
      );

      // Hitung newUrls SEBELUM setState (React memanggil functional updater secara lazy)
      const newUrls: string[] = [];
      const updatedEntries = entries.map((entry, i) => {
        const result = results[i];
        if (result?.status === "fulfilled" && result.value?.url) {
          newUrls.push(result.value.url);
          return { ...entry, progress: "done" as const };
        }
        return {
          ...entry,
          progress: "error" as const,
          error: result?.status === "rejected"
            ? (result.reason as Error)?.message ?? "Gagal"
            : "Gagal",
        };
      });

      setUploading((prev) =>
        prev.map((entry) => {
          const updated = updatedEntries.find((u) => u.id === entry.id);
          return updated ?? entry;
        })
      );

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }

      setTimeout(() => {
        setUploading((prev) => prev.filter((e) => e.progress !== "done"));
      }, 1500);
    },
    [value, onChange, maxFiles, folder]
  );

  // ── Hapus foto ────────────────────────────────────────────────────────────
  const handleRemove = (url: string) => {
    const path = url.split("/auction-images/")[1];
    if (path) {
      fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" }).catch(() => {});
    }
    onChange(value.filter((u) => u !== url));
  };

  // ── Validasi & tambahkan URL foto ─────────────────────────────────────────
  const validateAndAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    // Validasi format URL dasar
    try {
      new URL(trimmed);
    } catch {
      setUrlState("error");
      setUrlError("Format URL tidak valid.");
      return;
    }

    // Cek apakah URL terlihat seperti gambar (opsional extension check)
    const isImageExt = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(trimmed);
    const isKnownImageHost = /supabase\.co|imgur\.com|cloudinary\.com|googleusercontent\.com|unsplash\.com|pexels\.com/i.test(trimmed);

    if (!isImageExt && !isKnownImageHost) {
      // Tetap coba load dengan preview check
    }

    setUrlState("checking");
    setUrlError("");

    // Verifikasi gambar bisa diload
    const img = new window.Image();
    img.onload = () => {
      setUrlState("valid");
      if (value.length < maxFiles) {
        onChange([...value, trimmed]);
        setUrlInput("");
        setUrlState("idle");
      }
    };
    img.onerror = () => {
      setUrlState("error");
      setUrlError("URL tidak mengarah ke gambar yang valid atau tidak dapat diakses.");
    };
    img.src = trimmed;
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndAddUrl();
    }
  };

  const canAddMore = value.length + uploading.filter((u) => u.progress === "uploading").length < maxFiles;

  return (
    <div className="space-y-3">
      {/* ── Grid foto yang sudah ada ─────────────────────────────────── */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {value.map((url, i) => (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0f1e]"
            >
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                className="object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-fish.jpg"; }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="w-7 h-7 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}

          {/* Sedang upload */}
          {uploading.map((f) => (
            <div
              key={f.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0f1e]"
            >
              <Image src={f.preview} alt={f.name} fill className="object-cover opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {f.progress === "uploading" && <Loader2 className="w-5 h-5 text-white animate-spin" />}
                {f.progress === "done" && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                {f.progress === "error" && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-[9px] text-center px-1 leading-tight">{f.error}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Mode tabs (hanya tampil jika masih bisa tambah) ─────────── */}
      {canAddMore && (
        <div className="space-y-2">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === "upload"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Upload className="w-3 h-3" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => { setMode("url"); setUrlState("idle"); setUrlError(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === "url"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Link2 className="w-3 h-3" />
              URL Foto
            </button>
          </div>

          {/* ── Tab: Upload File ──────────────────────────────────────── */}
          {mode === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 px-4 cursor-pointer transition-all ${
                dragging
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-white/[0.10] hover:border-emerald-500/40 hover:bg-white/[0.02]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                <Upload className={`w-5 h-5 ${dragging ? "text-emerald-400" : "text-zinc-500"}`} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-zinc-300">
                  {dragging ? "Lepaskan file di sini" : "Drag & drop foto, atau klik untuk pilih"}
                </p>
                <p className="text-xs text-zinc-600">
                  JPG, PNG, WebP, GIF · Maks 5MB per file · {value.length}/{maxFiles} foto
                </p>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400/80 text-[10px] font-medium px-2.5 py-1 rounded-full">
                  <span className="text-amber-400">📐</span>
                  Rasio ideal <strong className="text-amber-300">4:3</strong> · Min. <strong className="text-amber-300">800 × 600 px</strong> agar tidak terpotong
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          )}

          {/* ── Tab: URL Foto ─────────────────────────────────────────── */}
          {mode === "url" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlState("idle"); setUrlError(""); }}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="https://example.com/foto-ikan.jpg"
                    className={`w-full bg-white/[0.04] border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                      urlState === "error"
                        ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20"
                        : urlState === "valid"
                        ? "border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/20"
                        : "border-white/[0.08] focus:border-sky-500/50 focus:ring-sky-500/20"
                    }`}
                  />
                  {/* Status indicator inside input */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {urlState === "checking" && <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />}
                    {urlState === "valid" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {urlState === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={validateAndAddUrl}
                  disabled={!urlInput.trim() || urlState === "checking" || value.length >= maxFiles}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0"
                >
                  {urlState === "checking" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Tambah
                </button>
              </div>

              {/* Error message */}
              {urlState === "error" && urlError && (
                <p className="text-red-400 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {urlError}
                </p>
              )}

              {/* Preview URL yang diinput */}
              {urlInput.trim() && urlState === "idle" && (
                <p className="text-zinc-600 text-[11px]">
                  Tekan <kbd className="bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded text-zinc-400 font-mono text-[10px]">Enter</kbd> atau klik Tambah untuk memvalidasi URL.
                </p>
              )}

              <p className="text-zinc-700 text-[10px] flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                Tempel URL gambar dari Supabase, Google Drive, Imgur, Cloudinary, atau link gambar langsung.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hint cover */}
      {value.length > 0 && (
        <p className="text-[10px] text-zinc-700 flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3" />
          Foto pertama otomatis menjadi foto cover. Hapus untuk mengubah urutan.
        </p>
      )}

      {/* Max reached */}
      {!canAddMore && (
        <p className="text-[11px] text-amber-500/70 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Maksimal {maxFiles} foto telah tercapai. Hapus foto untuk menambah yang baru.
        </p>
      )}
    </div>
  );
}
