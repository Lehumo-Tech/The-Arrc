"use client";

import Image from "next/image";
import { useRef, useCallback, useState, useEffect } from "react";
import { fetchContent } from "@/lib/content-client";
import { motion, useInView } from "framer-motion";
import { Shield, Scale, TrendingUp, Handshake, Sparkles } from "lucide-react";

/* ─── Data type ─── */
type ValueItem = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const valueCardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

function TiltValueCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform =
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return (
    <motion.div
      custom={index}
      variants={valueCardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card-premium rounded-xl p-5 cursor-default border-l-3 border-l-arrc-gold border-t-2 border-t-arrc-gold/20 hover:bg-gradient-to-r hover:from-arrc-gold/5 hover:to-transparent"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out, box-shadow 0.3s ease, background 0.3s ease",
        }}
      >
        <div style={{ transform: "translateZ(20px)" }}>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-arrc-gold/15">
            <Icon className="h-6 w-6 text-arrc-gold" />
          </div>
          <h3 className="font-heading font-semibold text-arrc-950 text-sm">{title}</h3>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function About() {
  const [values, setValues] = useState<ValueItem[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.values) {
          setValues(
            data.values.map((item: Record<string, unknown>) => ({
              icon: Shield,
              title: item.title as string,
              description: (item.description as string) || "",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Warm gradient background with subtle golden wash at top */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdf9ef] via-[#faf8f2] to-[#faf8f2]" />
      {/* Golden wash at top */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-arrc-gold/[0.06] to-transparent pointer-events-none" />

      {/* African pattern overlay */}
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.03]" />

      <motion.div
        ref={sectionRef}
        variants={sectionVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image Column — 3D Tilted Card with photo-frame */}
          <motion.div
            className="relative perspective-container"
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="relative photo-frame depth-shadow"
              whileHover={{
                rotateY: 6,
                rotateX: -2,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Image
                src="/campaigns/door-to-door-campaign.jpeg"
                alt="ARRC Community Engagement"
                width={640}
                height={480}
                className="h-auto w-full object-cover"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-arrc-950/20 to-transparent pointer-events-none" />
            </motion.div>

            {/* Thin gold accent line below image */}
            <div className="mt-4 h-[2px] w-2/3 mx-auto bg-gradient-to-r from-transparent via-arrc-gold/50 to-transparent rounded-full" />

            {/* Gold circular badge overlay with pulsing ring */}
            <motion.div
              className="absolute -bottom-5 -right-5 sm:h-28 sm:w-28"
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 200 }}
            >
              {/* Pulsing gold ring */}
              <div className="absolute inset-0 rounded-full animate-gold-ring-pulse" />
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-arrc-gold text-arrc-950 shadow-lg animate-pulse-glow">
                <div className="text-center font-heading">
                  <div className="text-sm font-extrabold leading-tight tracking-wide">
                    NEW
                  </div>
                  <div className="text-sm font-extrabold leading-tight tracking-wide">
                    GEN
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-4xl font-bold text-arrc-950 sm:text-5xl font-heading">
              About The ARRC
            </h2>
            {/* Decorative gold divider with diamond */}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-[2px] w-12 bg-arrc-gold rounded-full" />
              <span className="text-arrc-gold text-xs leading-none">◆</span>
              <div className="h-[2px] w-12 bg-arrc-gold rounded-full" />
            </div>

            <p className="mt-6 text-base text-gray-600 leading-loose">
              The African Royal Rainbow Congress (ARRC) is a people-first
              political movement dedicated to transforming South Africa through
              transparency, justice, and progressive governance. Founded on the
              belief that every South African deserves a voice, ARRC represents
              the aspirations of millions who seek a government that truly serves
              its people.
            </p>
            <p className="mt-4 text-base text-gray-600 leading-loose">
              Our movement is funded by the people — through affordable R20
              annual membership fees — ensuring that our loyalty remains with
              South Africans, not special interests. We are committed to building
              a nation where opportunity, dignity, and equality are not
              privileges but rights for all.
            </p>

            {/* Ubuntu blockquote */}
            <blockquote className="mt-6 border-l-3 border-arrc-gold pl-4 py-1">
              <p className="text-sm font-heading font-semibold italic text-arrc-950/70 leading-relaxed">
                &ldquo;Ubuntu — I am because we are&rdquo;
              </p>
            </blockquote>

            {/* Core Values — 2×2 Grid with 3D Tilt */}
            {values.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-4">
                {values.map((value, i) => (
                  <TiltValueCard
                    key={value.title}
                    icon={value.icon}
                    title={value.title}
                    description={value.description}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-3 rounded-xl bg-arrc-50 border border-arrc-100 p-4"
              >
                <Sparkles className="h-5 w-5 text-arrc-gold shrink-0" />
                <p className="text-sm text-arrc-800">Our core values will be announced soon</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
