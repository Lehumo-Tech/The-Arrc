"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Play,
  Pause,
  Newspaper,
} from "lucide-react";

/* ─── Types ─── */
interface CarouselSlide {
  slug: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  category: string;
  date: string | null;
}

interface MarketingCarouselProps {
  /** Navigate to a view (e.g. "news", "events"). */
  onNavigate?: (view: string) => void;
}

/* ─── Constants ─── */
const AUTOPLAY_MS = 6500;
const MIN_SLIDES = 2;

/* ─── Category display config ─── */
const CATEGORY_CONFIG: Record<
  string,
  { label: string }
> = {
  campaigns: { label: "Campaigns" },
  policy: { label: "Policy" },
  community: { label: "Community" },
  youth: { label: "Youth" },
  rally: { label: "Rally" },
  manifesto: { label: "Manifesto" },
  "presidential report": { label: "Presidential Report" },
  general: { label: "News" },
};

/* ─── Format date ─── */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/* ─── Component ─── */
export function MarketingCarousel({ onNavigate }: MarketingCarouselProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Fetch featured news ─── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content?type=news");
        const data = await res.json();
        const items = (data.items || []) as Record<string, unknown>[];
        // Prefer featured, then most recent
        const list: CarouselSlide[] = items.map((c) => ({
          slug: (c.id as string) || "",
          title: (c.title as string) || "",
          summary:
            ((c.description as string) || (c.content as string) || "").slice(0, 200),
          imageUrl: (c.imageUrl as string) || null,
          category: (c.category as string) || "general",
          date: (c.date as string) || null,
        }));
        if (cancelled) return;
        setSlides(list);
      } catch {
        /* leave empty — fallback UI shows */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Autoplay ─── */
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent(
      (prev) =>
        (prev - 1 + Math.max(slides.length, 1)) %
        Math.max(slides.length, 1)
    );
  }, [slides.length]);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  useEffect(() => {
    if (isPaused || slides.length < MIN_SLIDES) return;
    timerRef.current = setTimeout(goNext, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, slides.length, goNext]);

  /* ─── Keyboard nav ─── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <section className="relative w-full h-[440px] sm:h-[500px] lg:h-[560px] bg-arrc-950 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-arrc-gold border-t-transparent mb-4" />
          <p className="text-white/60 text-sm font-heading">Loading latest news…</p>
        </div>
      </section>
    );
  }

  /* ─── Empty state ─── */
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[440px] sm:h-[500px] lg:h-[560px] bg-gradient-to-br from-arrc-950 via-arrc-900 to-arrc-gold/20 overflow-hidden flex items-center justify-center">
        <div className="text-center px-4">
          <Newspaper className="h-12 w-12 text-arrc-gold/50 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-heading">
            Latest news coming soon.
          </p>
          <p className="text-white/40 text-xs mt-2">
            Check back shortly for updates from the movement.
          </p>
        </div>
      </section>
    );
  }

  const active = slides[current];
  const cat = CATEGORY_CONFIG[active.category?.toLowerCase()] || CATEGORY_CONFIG.general;

  /* ─── Slide transition variants ─── */
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.04,
      x: dir > 0 ? 40 : -40,
    }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 1.02,
      x: dir > 0 ? -40 : 40,
    }),
  };

  return (
    <section
      className="relative w-full h-[440px] sm:h-[500px] lg:h-[560px] bg-arrc-950 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="ARRC latest news"
    >
      {/* ─── Slides ─── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.6, ease: "easeOut" },
            scale: { duration: 0.8, ease: "easeOut" },
            x: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="absolute inset-0"
        >
          {/* Background image with Ken Burns effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
              className="absolute inset-0"
            >
              {active.imageUrl ? (
                <Image
                  src={active.imageUrl}
                  alt={active.title}
                  fill
                  priority={current === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-arrc-950 via-arrc-900 to-arrc-gold/20" />
              )}
            </motion.div>
          </div>

          {/* Gradient overlays for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-arrc-950/90 via-arrc-950/60 to-arrc-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/80 via-transparent to-arrc-950/30" />

          {/* Content */}
          <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center pb-16 sm:pb-20">
            <div className="max-w-2xl py-8 sm:py-10 lg:py-12">
              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/15 border border-arrc-gold/30 backdrop-blur-sm px-4 py-1.5 mb-5"
              >
                <Newspaper className="h-3.5 w-3.5 text-arrc-gold" />
                <span className="text-xs font-bold tracking-widest uppercase text-arrc-gold font-heading">
                  {cat.label}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-heading font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-4"
              >
                {active.title}
              </motion.h2>

              {/* Summary */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-white/70 text-base sm:text-lg leading-relaxed mb-6 line-clamp-3 max-w-xl"
              >
                {active.summary}
              </motion.p>

              {/* Date */}
              {active.date && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="mb-6 max-w-md"
                >
                  <div className="flex items-center gap-1.5 text-white/50 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(active.date)}</span>
                  </div>
                </motion.div>
              )}

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => onNavigate?.("news")}
                  className="group/btn inline-flex items-center gap-2 rounded-full bg-arrc-gold px-7 py-3 font-heading font-bold text-arrc-950 transition-all hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(212,168,67,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arrc-gold focus-visible:ring-offset-2 focus-visible:ring-offset-arrc-950"
                >
                  <Newspaper className="h-4 w-4" />
                  Read More News
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate?.("events")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm px-6 py-3 font-heading font-semibold text-white/90 transition-all hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-arrc-950"
                >
                  <Calendar className="h-4 w-4" />
                  View Events
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ─── Navigation arrows (desktop) ─── */}
      {slides.length >= MIN_SLIDES && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous article"
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arrc-gold"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next article"
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arrc-gold"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ─── Bottom control bar: dots + counter + pause ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Autoplay progress bar */}
        {slides.length >= MIN_SLIDES && (
          <div className="h-0.5 w-full bg-white/10">
            <motion.div
              key={`${current}-${isPaused}`}
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? "0%" : "100%" }}
              transition={{
                duration: isPaused ? 0 : AUTOPLAY_MS / 1000,
                ease: "linear",
              }}
              className="h-full bg-arrc-gold/80"
            />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((c, i) => (
              <button
                key={c.slug}
                onClick={() => goTo(i)}
                aria-label={`Go to article ${i + 1}: ${c.title}`}
                className="group/dot relative h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arrc-gold focus-visible:ring-offset-2 focus-visible:ring-offset-arrc-950"
                style={{
                  width: i === current ? 32 : 8,
                  backgroundColor:
                    i === current ? "rgba(212,168,67,0.9)" : "rgba(255,255,255,0.25)",
                }}
              >
                {i === current && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute inset-0 rounded-full bg-arrc-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Counter + pause */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-white/50 text-xs font-heading tabular-nums tracking-wider">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
            {slides.length >= MIN_SLIDES && (
              <button
                onClick={() => setIsPaused((p) => !p)}
                aria-label={isPaused ? "Play autoplay" : "Pause autoplay"}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arrc-gold"
              >
                {isPaused ? (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                ) : (
                  <Pause className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
