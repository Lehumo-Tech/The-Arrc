"use client";

import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  ScrollText,
  CalendarDays,
  Newspaper,
  Crown,
  Heart,
  Shield,
  TrendingUp,
} from "lucide-react";
import { BentoGrid, BentoCell, BentoStat } from "@/components/arrc/bento-grid";

/**
 * HomeStats — a bento-grid showcase of ARRC movement metrics.
 *
 * This is the flagship application of the liquid-glass + bento-grid design
 * language on the home page. Each cell uses a different liquid-glass variant
 * (dark, gold, clear) to demonstrate the depth and versatility of the system.
 *
 * Layout (desktop, 4-column grid):
 *   ┌──────────────┬──────────┬──────────┐
 *   │   MEMBERS    │ PROVINCES│ POLICIES │
 *   │   (large)    │          │          │
 *   ├──────────────┼──────────┴──────────┤
 *   │   R20 FEE    │   UPCOMING EVENTS   │
 *   │   (gold)     │      (wide)         │
 *   ├──────────┬───┴──────────┬──────────┤
 *   │  NEWS    │  PEOPLE-FUNDED│ DONATE  │
 *   └──────────┴───────────────┴──────────┘
 */
interface HomeStatsProps {
  onNavigate?: (view: string) => void;
}

export function HomeStats({ onNavigate }: HomeStatsProps) {
  return (
    <section className="py-20 bg-arrc-dark-section relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-arrc-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.03]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-arrc-gold/40" />
            <span className="text-arrc-gold text-xs tracking-widest uppercase">
              By The Numbers
            </span>
            <div className="h-px w-8 bg-arrc-gold/40" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold font-heading text-white">
            A Movement Built By{" "}
            <span className="gradient-text">The People</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Real South Africans, real impact. Here&apos;s what we&apos;ve built together —
            and we&apos;re just getting started.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid>
          {/* Cell 1: Members (large, 2x2) */}
          <BentoCell span="large" variant="glass-dark" interactive shimmer>
            <div className="bento-stat h-full">
              <div className="flex items-start justify-between">
                <div className="bento-stat-icon bg-arrc-gold/20 text-arrc-gold">
                  <Users className="h-5 w-5" />
                </div>
                <span className="badge-premium bg-arrc-gold/10 text-arrc-gold border border-arrc-gold/20">
                  Growing
                </span>
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value gradient-text">350K+</div>
                <div className="bento-stat-label">South Africans Mobilised</div>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">
                  From all nine provinces, uniting under one vision for a stronger,
                  fairer South Africa.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* Cell 2: Provinces */}
          <BentoCell variant="glass-dark" interactive>
            <div className="bento-stat h-full">
              <div className="bento-stat-icon bg-blue-500/20 text-blue-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value text-white">9</div>
                <div className="bento-stat-label">Provinces Active</div>
              </div>
            </div>
          </BentoCell>

          {/* Cell 3: Policies */}
          <BentoCell variant="glass-dark" interactive>
            <div className="bento-stat h-full">
              <div className="bento-stat-icon bg-emerald-500/20 text-emerald-400">
                <ScrollText className="h-5 w-5" />
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value text-white">6</div>
                <div className="bento-stat-label">Core Policies</div>
              </div>
            </div>
          </BentoCell>

          {/* Cell 4: R20 Membership (gold, wide) */}
          <BentoCell
            span="wide"
            variant="glass-gold"
            interactive
            shimmer
            onClick={() => onNavigate?.("join")}
          >
            <div className="bento-stat h-full">
              <div className="flex items-start justify-between">
                <div className="bento-stat-icon bg-arrc-gold/20 text-arrc-gold">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="badge-premium bg-arrc-gold text-arrc-950">
                  R20 / Year
                </span>
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value gradient-text">R20</div>
                <div className="bento-stat-label text-arrc-gold/80">
                  People-Funded Membership
                </div>
                <p className="mt-2 text-sm text-white/60">
                  Affordable for every South African. No corporate donors, no
                  strings attached.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* Cell 5: Events (wide) */}
          <BentoCell
            span="wide"
            variant="glass-dark"
            interactive
            onClick={() => onNavigate?.("events")}
          >
            <div className="bento-stat h-full">
              <div className="flex items-start justify-between">
                <div className="bento-stat-icon bg-orange-500/20 text-orange-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <span className="text-xs text-white/40">View All →</span>
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value text-white">13+</div>
                <div className="bento-stat-label">Upcoming Events</div>
                <p className="mt-2 text-sm text-white/50">
                  Door-to-door campaigns, community marches, and mobilization
                  drives across the country.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* Cell 6: News */}
          <BentoCell
            variant="glass-dark"
            interactive
            onClick={() => onNavigate?.("news")}
          >
            <div className="bento-stat h-full">
              <div className="bento-stat-icon bg-purple-500/20 text-purple-400">
                <Newspaper className="h-5 w-5" />
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value text-white">6</div>
                <div className="bento-stat-label">Latest Stories</div>
              </div>
            </div>
          </BentoCell>

          {/* Cell 7: People-Funded */}
          <BentoCell variant="glass-dark">
            <div className="bento-stat h-full">
              <div className="bento-stat-icon bg-cyan-500/20 text-cyan-400">
                <Shield className="h-5 w-5" />
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value text-white">100%</div>
                <div className="bento-stat-label">People-Funded</div>
              </div>
            </div>
          </BentoCell>

          {/* Cell 8: Donate CTA */}
          <BentoCell
            variant="glass-gold"
            interactive
            shimmer
            onClick={() => onNavigate?.("donate")}
          >
            <div className="bento-stat h-full">
              <div className="bento-stat-icon bg-arrc-gold/20 text-arrc-gold">
                <Heart className="h-5 w-5" />
              </div>
              <div className="mt-auto">
                <div className="bento-stat-value gradient-text">Support</div>
                <div className="bento-stat-label text-arrc-gold/80">
                  Fuel The Movement
                </div>
              </div>
            </div>
          </BentoCell>
        </BentoGrid>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onNavigate?.("join")}
            className="group inline-flex items-center gap-2 rounded-full bg-arrc-gold px-8 py-3 font-heading font-bold text-arrc-950 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,168,67,0.4)]"
          >
            <Crown className="h-4 w-4" />
            Join For R20
            <TrendingUp className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigate?.("about")}
            className="inline-flex items-center gap-2 rounded-full border border-arrc-gold/30 px-8 py-3 font-heading font-semibold text-white/80 transition-all hover:border-arrc-gold/60 hover:text-white"
          >
            Learn More About ARRC
          </button>
        </motion.div>
      </div>
    </section>
  );
}
