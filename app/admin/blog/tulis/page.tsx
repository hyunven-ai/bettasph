"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle2, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { RichTextEditor } from "@/components/RichTextEditor";

function TulisArtikelForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Pengetahuan",
    excerpt: "",
    content: "",
    image_url: "",
    author: "Ikanpedia.id Expert",
    published: false,
    meta_title: "",
    meta_description: "",
    focus_keyword: "",
    tags: [] as string[],
  });

  // Jika mode edit, ambil data existing
  useEffect(() => {
    if (!editId) return;
    setFetchingEdit(true);
    fetch(`/api/blog/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.title) {
          setFormData({
            title: data.title,
            slug: data.slug || "",
            category: data.category || "Pengetahuan",
            excerpt: data.excerpt || "",
            content: data.content || "",
            image_url: data.image_url || "",
            author: data.author || "Ikanpedia.id Expert",
            published: data.published || false,
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            focus_keyword: data.focus_keyword || "",
            tags: data.tags || [],
          });
        }
      })
      .catch(() => alert("Gagal memuat data artikel untuk diedit."))
      .finally(() => setFetchingEdit(false));
  }, [editId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // Handle checkbox separately
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditorChange = (htmlContent: string) => {
    setFormData({ ...formData, content: htmlContent });
  };

  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(data => {
      if(Array.isArray(data)) setAllBlogs(data);
    });
  }, []);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !formData.tags.includes(val)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const getInternalLinks = () => {
    if(!formData.focus_keyword.trim() || !allBlogs.length) return allBlogs.slice(0, 3);
    const kw = formData.focus_keyword.toLowerCase();
    return allBlogs.filter(b => 
      b.id !== editId && 
      (b.title.toLowerCase().includes(kw) || 
       b.excerpt?.toLowerCase().includes(kw) || 
       (b.tags && b.tags.some((t:string) => t.toLowerCase().includes(kw))))
    ).slice(0, 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res: Response;

      if (isEditMode) {
        res = await fetch(`/api/blog/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        alert("Gagal menyimpan artikel: " + (result.error ?? "Unknown error"));
      } else {
        setSuccess(true);
        if (!isEditMode) {
          setFormData({
            title: "",
            slug: "",
            category: "Pengetahuan",
            excerpt: "",
            content: "",
            image_url: "",
            author: "Ikanpedia.id Expert",
            published: false,
            meta_title: "",
            meta_description: "",
            focus_keyword: "",
            tags: [],
          });
        }
        setTimeout(() => {
          setSuccess(false);
          if (isEditMode) router.push("/admin/blog");
        }, 2000);
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan artikel.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEdit) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <Link
        href="/admin/blog"
        className="inline-flex items-center text-zinc-400 hover:text-zinc-100 mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Artikel
      </Link>

      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-indigo-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex items-center gap-4 mb-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              {isEditMode ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {isEditMode
                ? "Perbarui jurnal atau berita yang sudah pernah ditulis."
                : "Buat jurnal edukasi yang menarik bagi pencinta ikan hias."}
            </p>
          </div>
        </div>

        {success && (
          <div className="mt-6 mb-2 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">
              {isEditMode ? "Artikel berhasil diperbarui!" : "Artikel berhasil diterbitkan ke database!"}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Judul Artikel</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Rahasia Air Ketapang untuk Cupang"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Ringkasan (Excerpt)</label>
                <textarea
                  name="excerpt"
                  required
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Deskripsi singkat yang akan muncul di halaman daftar artikel..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-300">Isi Konten (Rich Text)</label>
                <div className="min-h-[300px]">
                  <RichTextEditor 
                    content={formData.content} 
                    onChange={handleEditorChange} 
                  />
                </div>
              </div>

              <div className="space-y-6 mt-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-zinc-100">SEO Settings & Metadata</h2>
                </div>
                
                <div className="bg-[#11121f] border border-zinc-800 rounded-xl p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-zinc-300">Meta Title</label>
                      <input
                        type="text"
                        name="meta_title"
                        value={formData.meta_title}
                        onChange={handleChange}
                        placeholder="Ex: Panduan Lengkap Merawat Cupang 2026"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-zinc-300">Focus Keyword</label>
                      <input
                        type="text"
                        name="focus_keyword"
                        value={formData.focus_keyword}
                        onChange={handleChange}
                        placeholder="Ex: perawatan cupang"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-zinc-300">Meta Description</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tulis deskripsi singkat untuk mesin pencari..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none font-medium"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[13px] font-semibold text-zinc-300">Tags</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          placeholder="Ketik tag dan tekan Enter..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                              setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                            }
                            setTagInput("");
                          }}
                          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-xl transition-colors sm:w-auto w-full"
                        >
                          Add
                        </button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map(tag => (
                            <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-sm">
                              <span>{tag}</span>
                              <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-white">
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Internal Links Suggestions */}
                <div className="bg-[#11121f] border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-200">Internal Link Suggestions</h3>
                  <div className="space-y-3">
                    {getInternalLinks().length > 0 ? (
                      getInternalLinks().map(link => (
                        <div key={link.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between group">
                          <div className="truncate pr-4 flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{link.title}</p>
                            <p className="text-xs text-zinc-500 truncate mt-0.5">/blog/{link.slug}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                               navigator.clipboard.writeText(`/blog/${link.slug}`);
                               alert("Link tersalin!");
                            }}
                            className="shrink-0 px-3 py-1.5 bg-zinc-800 hover:bg-indigo-500 hover:text-white text-zinc-300 text-xs font-medium rounded-lg transition-colors ml-2"
                          >
                            Copy Link
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">Belum ada saran link internal.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Settings Column */}
            <div className="space-y-6">
              
              <div className="bg-[#11121f] border border-zinc-800 rounded-xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">Status Publikasi</h3>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                      className="peer appearance-none w-5 h-5 border-2 border-zinc-700 bg-zinc-900 rounded checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer"
                    />
                    <CheckCircle2 className="absolute text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {formData.published ? "Publik (Live)" : "Simpan sbg Draft"}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {formData.published ? "Langsung tampil di website" : "Sembunyikan dari pengunjung"}
                    </span>
                  </div>
                </label>
              </div>

              <div className="bg-[#11121f] border border-zinc-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">Informasi Meta</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Kategori Artikel</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="Tips Perawatan">Tips Perawatan</option>
                    <option value="Setup & Filtrasi">Setup & Filtrasi</option>
                    <option value="Pengetahuan">Pengetahuan</option>
                    <option value="Berita Farm">Berita Farm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Nama Penulis</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="bg-[#11121f] border border-zinc-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">Thumbnail Cover</h3>
                
                <div className="space-y-3">
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="Masukkan URL foto publik..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  
                  {formData.image_url ? (
                    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-2">
                      <ImageIcon className="w-6 h-6 text-zinc-700" />
                      <span className="text-xs font-medium">Belum ada thumbnail</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/80 flex lg:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full lg:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditMode ? "Simpan Perubahan Artikel" : "Terbitkan Artikel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TulisArtikel() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <TulisArtikelForm />
    </Suspense>
  );
}
