"use client";

import { useEffect, useState, useCallback } from "react";

interface CountdownTimerProps {
  endsAt: string;
  startsAt?: string;
  status: string;
  onExpired?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

export default function CountdownTimer({
  endsAt,
  startsAt,
  status,
  onExpired,
  className = "",
  size = "md",
}: CountdownTimerProps) {
  const isScheduled = status === "scheduled";
  const targetTime = isScheduled && startsAt ? startsAt : endsAt;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [hasExpired, setHasExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  const tick = useCallback(() => {
    const t = calcTimeLeft(targetTime);
    setTimeLeft(t);
    if (t.total <= 0 && !hasExpired) {
      setHasExpired(true);
      onExpired?.();
    }
  }, [targetTime, hasExpired, onExpired]);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calcTimeLeft(targetTime));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick, targetTime]);

  // Urgent jika < 1 jam
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600 * 1000;
  const isEnded = status === "ended" || (status === "active" && timeLeft.total <= 0);

  const sizeCls = {
    sm: { box: "text-xs px-1.5 py-0.5 rounded-md", label: "text-[9px]", sep: "text-base" },
    md: { box: "text-sm px-2.5 py-1 rounded-lg", label: "text-[10px]", sep: "text-lg" },
    lg: { box: "text-xl px-4 py-2 rounded-xl", label: "text-xs", sep: "text-3xl" },
  }[size];

  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="inline-flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700 text-zinc-400 text-xs font-medium px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
          Memuat...
        </span>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="inline-flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700 text-zinc-400 text-xs font-medium px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
          Lelang Berakhir
        </span>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full">
        Dibatalkan
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      {isScheduled && (
        <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
          Dimulai dalam
        </p>
      )}
      {!isScheduled && (
        <p className={`text-[10px] font-medium uppercase tracking-wider ${isUrgent ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
          {isUrgent ? "⚡ Segera berakhir" : "Sisa waktu"}
        </p>
      )}

      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <TimeBox value={pad(timeLeft.days)} label="Hari" urgent={isUrgent} sizeCls={sizeCls} scheduled={isScheduled} />
            <Separator sizeCls={sizeCls} />
          </>
        )}
        <TimeBox value={pad(timeLeft.hours)} label="Jam" urgent={isUrgent} sizeCls={sizeCls} scheduled={isScheduled} />
        <Separator sizeCls={sizeCls} />
        <TimeBox value={pad(timeLeft.minutes)} label="Menit" urgent={isUrgent} sizeCls={sizeCls} scheduled={isScheduled} />
        <Separator sizeCls={sizeCls} />
        <TimeBox value={pad(timeLeft.seconds)} label="Detik" urgent={isUrgent} sizeCls={sizeCls} scheduled={isScheduled} />
      </div>
    </div>
  );
}

function TimeBox({
  value, label, urgent, scheduled, sizeCls,
}: {
  value: string; label: string; urgent: boolean; scheduled: boolean;
  sizeCls: { box: string; label: string; sep: string };
}) {
  const bg = scheduled
    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
    : urgent
    ? "bg-red-500/15 border-red-500/40 text-red-300"
    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-200";

  return (
    <div className={`flex flex-col items-center border font-mono font-bold tabular-nums min-w-[2.5rem] ${bg} ${sizeCls.box}`}>
      <span>{value}</span>
      <span className={`font-sans font-normal opacity-60 ${sizeCls.label}`}>{label}</span>
    </div>
  );
}

function Separator({ sizeCls }: { sizeCls: { sep: string } }) {
  return (
    <span className={`font-bold text-zinc-600 leading-none mb-3 ${sizeCls.sep}`}>:</span>
  );
}
