"use client";

import Image from "next/image";
import { useRef, useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Heart, Crown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const headlineLine1 = "The People's Voice,";
const headlineLine2 = "South Africa's Strength";

/* ------------------------------------------------------------------ */
/*  Floating Particles                                                 */
/* ------------------------------------------------------------------ */

function FloatingParticles() {
  // Deterministic particle data to avoid SSR mismatch
  // 30% diamond-shaped (◆), 70% circle — cultural resonance
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: ((i * 37 + 13) % 100),
        delay: (i * 0.27) % 8,
        duration: 8 + ((i * 1.3) % 12),
        size: 3 + ((i * 0.9) % 6), // larger and more varied (was 2 + 0.7 % 4)
        opacity: 0.15 + ((i * 0.04) % 0.55),
        xDrift: ((i * 17 - 50) / 100) * 80,
        isDiamond: i % 10 < 3, // 30% diamonds
      })),
    []
  );

  return (
    <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={"absolute bg-arrc-gold " + (p.isDiamond ? "" : "rounded-full")}
          style={{
            left: `${p.x}%`,
            bottom: "-5%",
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            ...(p.isDiamond ? { transform: "rotate(45deg)" } : {}),
          }}
          animate={{
            y: [0, -1200],
            x: [0, p.xDrift],
            opacity: [p.opacity, p.opacity * 0.5, 0],
            ...(p.isDiamond ? { rotate: [45, 90, 135, 180] } : {}),
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Counter                                                    */
/* ------------------------------------------------------------------ */

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }, [inView, target]);

  const formatted =
    target >= 1000
      ? count.toLocaleString()
      : String(count);

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated text reveal (for large formatted numbers like "2.5M+")    */
/* ------------------------------------------------------------------ */

function AnimatedText({ text, inView }: { text: string; inView: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <span
      className={`inline-block transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Letter-by-letter headline                                          */
/* ------------------------------------------------------------------ */

function StaggeredText({
  text,
  className,
  delayOffset = 0,
}: {
  text: string;
  className?: string;
  delayOffset?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            delay: delayOffset + i * 0.035,
            duration: 0.5,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  3D Hover Button                                                    */
/* ------------------------------------------------------------------ */

function Button3D({
  children,
  variant = "gold",
  href,
}: {
  children: React.ReactNode;
  variant?: "gold" | "outline";
  href: string;
}) {
  return (
    <motion.a
      href={href}
      className="perspective-container inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="tilt-card"
        whileHover={{
          rotateX: -3,
          rotateY: 3,
          translateZ: 20,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {variant === "gold" ? (
          <Button
            size="lg"
            className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-semibold text-base px-10 h-14 depth-shadow animate-pulse-glow shadow-[0_0_20px_rgba(212,168,67,0.4)]"
          >
            <Crown className="h-4 w-4 mr-2" />
            {children}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="border-arrc-gold/60 text-arrc-gold hover:bg-arrc-gold/10 font-heading font-semibold text-base px-8 h-12 backdrop-blur-sm"
          >
            {children}
          </Button>
        )}
      </motion.div>
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const stats = [
    { icon: Users, value: 2500000, suffix: "+", label: "Members", display: "2.5M+" },
    { icon: MapPin, value: 9, suffix: "", label: "Provinces" },
    { icon: Heart, value: 100, suffix: "%", label: "People-Funded Movement" },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: background moves slower than scroll
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  // Content fades out as you scroll down
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <Image
          src="/videos/thumbnails/arrc-president-report-kaalfontein-2026-07-09.jpg"
          alt="ARRC Supporters United for Change"
          fill
          className="object-cover scale-110"
          priority
          quality={75}
        />
        {/* Dark overlay with gradient */}
        <div className="hero-overlay absolute inset-0" />
        {/* Cinematic vignette effect */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
      </motion.div>

      {/* Floating Gold Particles */}
      <FloatingParticles />

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-28 pb-16"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Staggered Headline */}
        <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold tracking-tight text-white leading-tight">
          <StaggeredText text={headlineLine1} delayOffset={0.3} />
          <br />
          <StaggeredText
            text={headlineLine2}
            className="gradient-text"
            delayOffset={0.3 + headlineLine1.length * 0.035 + 0.15}
          />
        </h1>

        {/* Subtitle with fade-in — warmer white */}
        <motion.p
          className="mt-6 max-w-2xl text-lg text-white/90 sm:text-xl md:text-xl leading-relaxed tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3 + (headlineLine1.length + headlineLine2.length) * 0.035 + 0.4,
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          ARRC builds South Africa through progressive policies, transparency, and the power of unity.
          Join the movement that puts people first.
        </motion.p>

        {/* CTA Buttons with 3D hover */}
        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3 + (headlineLine1.length + headlineLine2.length) * 0.035 + 0.8,
            duration: 0.7,
            ease: "easeOut",
          }}
        >
          <Button3D variant="gold" href="#join">
            Join for R20
          </Button3D>
          <Button3D variant="outline" href="#policies">
            View Policies
          </Button3D>
        </motion.div>

        {/* Decorative diamond separator */}
        <motion.div
          className="mt-12 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-arrc-gold/40" />
          <span className="text-arrc-gold text-xs">◆</span>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-arrc-gold/40" />
        </motion.div>

        {/* Stats Row — liquid glass gold surface with refractive depth */}
        <motion.div
          ref={statsRef}
          className="mt-8 liquid-glass-gold liquid-glass-shimmer px-10 py-8 sm:px-16 sm:py-10"
          initial={{ opacity: 0, y: 30 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <div className="grid grid-cols-3 gap-6 sm:gap-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
              >
                <stat.icon className="h-6 w-6 text-arrc-gold mb-1" />
                <span className="text-2xl font-heading font-bold text-white sm:text-3xl md:text-4xl">
                  {stat.display ? (
                    <AnimatedText text={stat.display} inView={statsInView} />
                  ) : (
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      inView={statsInView}
                    />
                  )}
                </span>
                <span className="text-xs sm:text-sm text-white/70 border-b border-arrc-gold/30 pb-1 tracking-wider uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Elegant Ribbon Strip with SA flag colors */}
      <div className="relative z-10 overflow-hidden bg-arrc-950/80 backdrop-blur-md">
        {/* SA flag thin line — top */}
        <div className="sa-stripe" />
        <div className="py-4">
          <div className="animate-marquee flex whitespace-nowrap">
            {["The People's Voice", "A Stronger Nation Starts Here", "One Vision, One Future", "New Generation, New Direction", "Transparency · Justice · Progress"].flatMap((slogan) => [
              <span key={slogan} className="mx-8 text-sm font-medium text-white/70 tracking-widest">
                {slogan}
                <span className="text-arrc-gold mx-5 text-[10px]">◆</span>
              </span>,
              <span key={`${slogan}-2`} className="mx-8 text-sm font-medium text-white/70 tracking-widest">
                {slogan}
                <span className="text-arrc-gold mx-5 text-[10px]">◆</span>
              </span>,
            ])}
          </div>
        </div>
        {/* SA flag thin line — bottom */}
        <div className="sa-stripe" />
      </div>
    </section>
  );
}
