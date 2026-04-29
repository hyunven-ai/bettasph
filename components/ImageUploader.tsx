"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2, AlertCircle, GripVertical } from "lucide-react";

interface ImageUploaderProps {
  value: string[];              // URL-URL yang sudah terupload
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

export default function ImageUploader({
  value = [],
  onChange,
  maxFiles = 6,
  folder = "auctions",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragging, setDragging] = useState(false);

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

      // Buat preview entries
      const entries: UploadingFile[] = toUpload.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        preview: URL.createObjectURL(f),
        progress: "uploading",
      }));
      setUploading((prev) => [...prev, ...entries]);

      // Upload paralel
      const results = await Promise.allSettled(
        toUpload.map((file, i) => uploadFile(file).then((url) => ({ url, id: entries[i].id })))
      );

      const newUrls: string[] = [];
      setUploading((prev) =>
        prev.map((entry) => {
          const result = results.find((r, i) => entries[i]?.id === entry.id);
          if (!result) return entry;
          if (result.status === "fulfilled" && result.value.url) {
            newUrls.push(result.value.url);
            return { ...entry, progress: "done" as const };
          }
          return {
            ...entry,
            progress: "error" as const,
            error: result.status === "rejected" ? result.reason?.message : "Gagal",
          };
        })
      );

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }

      // Bersihkan entry yang selesai setelah 1.5 detik
      setTimeout(() => {
        setUploading((prev) => prev.filter((e) => e.progress !== "done"));
      }, 1500);
    },
    [value, onChange, maxFiles, folder]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = async (url: string) => {
    // Extract path dari URL untuk delete dari storage
    const path = url.split("/auction-images/")[1];
    if (path) {
      // Fire and forget — tidak block UI
      fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" }).catch(() => {});
    }
    onChange(value.filter((u) => u !== url));
  };

  const canUploadMore = value.length + uploading.filter((u) => u.progress === "uploading").length < maxFiles;

  return (
    <div className="space-y-3">
      {/* Foto yang sudah terupload */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {/* Foto done */}
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
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
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
              <Image
                src={f.preview}
                alt={f.name}
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {f.progress === "uploading" && (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                )}
                {f.progress === "done" && (
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                )}
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

      {/* Drop Zone */}
      {canUploadMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
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
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-300">
              {dragging ? "Lepaskan file di sini" : "Drag & drop foto, atau klik untuk pilih"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              JPG, PNG, WebP, GIF · Maks 5MB per file · {value.length}/{maxFiles} foto
            </p>
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

      {/* Hint foto pertama = cover */}
      {value.length > 0 && (
        <p className="text-[10px] text-zinc-700 flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3" />
          Foto pertama otomatis menjadi foto cover. Hapus untuk mengubah urutan.
        </p>
      )}

      {/* Max reached */}
      {!canUploadMore && (
        <p className="text-[11px] text-amber-500/70 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Maksimal {maxFiles} foto telah tercapai. Hapus foto untuk menambah yang baru.
        </p>
      )}
    </div>
  );
}
