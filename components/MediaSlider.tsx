"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";

interface MediaSliderProps {
  mediaUrls: string[];      // array of image or video URLs
  productName: string;
  fallbackUrl?: string;
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

export default function MediaSlider({ mediaUrls, productName, fallbackUrl }: MediaSliderProps) {
  // Build final media list: use mediaUrls if non-empty, else fallback to fallbackUrl
  const media = mediaUrls && mediaUrls.length > 0
    ? mediaUrls
    : fallbackUrl
    ? [fallbackUrl]
    : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, media.length - 1)));
  }, [media.length]);

  const prev = () => goTo(activeIndex === 0 ? media.length - 1 : activeIndex - 1);
  const next = () => goTo(activeIndex === media.length - 1 ? 0 : activeIndex + 1);

  if (media.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-[3rem] bg-[#0A0F1C] border border-white/5 flex items-center justify-center">
        <p className="text-slate-600 text-sm">Tidak ada media</p>
      </div>
    );
  }

  const currentMedia = media[activeIndex];
  const currentIsVideo = isVideo(currentMedia);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main Viewer ── */}
      <div className="relative group">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--color-brand-aqua)]/20 blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#0A0F1C] border border-white/5 shadow-2xl relative">

          {/* Image */}
          {!currentIsVideo && (
            <img
              key={currentMedia}
              src={currentMedia}
              alt={`${productName} — ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />
          )}

          {/* Video */}
          {currentIsVideo && (
            <video
              key={currentMedia}
              ref={videoRef}
              src={currentMedia}
              autoPlay
              loop
              muted={muted}
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050810]/80 via-transparent to-transparent pointer-events-none" />

          {/* Prev / Next — shown if more than 1 media */}
          {media.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Next media"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Video controls */}
          {currentIsVideo && (
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-[11px] font-bold">
                <Play className="w-3 h-3 fill-white" /> Video
              </span>
              <button
                onClick={() => setMuted((m) => !m)}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white hover:text-black transition-all"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Dot indicators */}
          {media.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to media ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Thumbnail Strip ── */}
      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {media.map((url, i) => {
            const isVid = isVideo(url);
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 relative ${
                  i === activeIndex
                    ? "border-[var(--color-brand-aqua)] shadow-[0_0_12px_rgba(23,211,158,0.4)]"
                    : "border-white/10 opacity-50 hover:opacity-80"
                }`}
              >
                {isVid ? (
                  <>
                    <video src={url} muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </>
                ) : (
                  <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
