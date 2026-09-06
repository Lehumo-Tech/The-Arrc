"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { fetchContent } from "@/lib/content-client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Crown, Users, UserCircle, Star, Shield, Flame, Swords, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ─── 3D Tilt Card ─── */
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  }

  function handleLeave() {
    setHovering(false);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      className={`perspective-container ${className}`}
    >
      <motion.div
        animate={{
          boxShadow: hovering
            ? "0 25px 60px -12px rgba(212,168,67,0.25), 0 20px 40px -8px rgba(0,0,0,0.2)"
            : "0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.06)",
        }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl overflow-hidden h-full"
        style={{ transform: "translateZ(0)" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Role badge icon mapper ─── */
function getBadgeIcon(badge: string) {
  const lower = badge.toLowerCase();
  if (lower.includes("president") && !lower.includes("vice") && !lower.includes("youth")) return Star;
  if (lower.includes("vice president")) return Shield;
  if (lower.includes("chairperson") || lower.includes("chair")) return Crown;
  if (lower.includes("secretary")) return Swords;
  if (lower.includes("youth")) return Flame;
  if (lower.includes("speaker")) return Shield;
  return UserCircle;
}

/* ─── Get role rank number for display ─── */
function getRoleRank(badge: string): number | null {
  const lower = badge.toLowerCase();
  if (lower.includes("president") && !lower.includes("vice") && !lower.includes("youth") && !lower.includes("deputy")) return 1;
  if (lower.includes("deputy president")) return 2;
  if (lower.includes("vice chairperson")) return 3;
  if (lower.includes("chairperson") || lower.includes("chair")) return 4;
  if (lower.includes("secretary")) return 5;
  if (lower.includes("youth president")) return 6;
  if (lower.includes("youth chairperson")) return 7;
  if (lower.includes("speaker")) return 8;
  return null;
}

/* ─── Data type ─── */
type LeaderItem = {
  image: string;
  badge: string;
  name: string;
  bio: string;
  fullBio: string;
  sortOrder: number;
  featured: boolean;
};

/* ─── Check if position is vacant ─── */
function isVacant(leader: LeaderItem) {
  return leader.name.toLowerCase().trim() === leader.badge.toLowerCase().trim();
}

/* ─── Section ─── */
export function NEC() {
  const [leaders, setLeaders] = useState<LeaderItem[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<LeaderItem | null>(null);

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.leaders) {
          setLeaders(
            data.leaders.map((item: Record<string, unknown>) => ({
              image: (item.imageUrl as string) || "",
              badge: (item.subtitle as string) || "Leader",
              name: item.title as string,
              bio: (item.description as string) || "",
              fullBio: (item.content as string) || "",
              sortOrder: (item.sortOrder as number) || 0,
              featured: (item.featured as boolean) || false,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  // Split leaders: featured (President/Commander in Chief) and others
  const featuredLeader = leaders.find((l) => l.featured);
  const otherLeaders = leaders
    .filter((l) => !l.featured)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Split other leaders into senior NEC and youth leadership
  const seniorLeaders = otherLeaders.filter((l) => !l.badge.toLowerCase().includes("youth"));
  const youthLeaders = otherLeaders.filter((l) => l.badge.toLowerCase().includes("youth"));

  return (
    <section id="nec" className="py-20 bg-arrc-950 relative overflow-hidden">
      {/* African pattern overlay */}
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.03]" />
      {/* Gold glow effects */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-arrc-gold/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-arrc-gold/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-heading">
            National Executive Committee
          </h2>
          <div className="mt-3 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-4 text-white/50 text-lg">
            Guided by vision, driven by the people
          </p>
        </motion.div>

        {leaders.length > 0 ? (
          <>
            {/* ═══════════════════════════════════════════════════════════
                FEATURED LEADER — President & Commander in Chief
                Name is OVERLAID on photo with strong backdrop
            ═══════════════════════════════════════════════════════════ */}
            {featuredLeader && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
                className="mb-14"
              >
                <div
                  className="max-w-4xl mx-auto rounded-2xl border-2 border-arrc-gold/50 overflow-hidden relative bg-gradient-to-br from-arrc-900 via-arrc-950 to-arrc-900 cursor-pointer"
                  onClick={() => setSelectedLeader(featuredLeader)}
                >
                  {/* Commander in Chief banner */}
                  <div className="bg-gradient-to-r from-arrc-gold/20 via-arrc-gold/30 to-arrc-gold/20 border-b border-arrc-gold/30 px-6 py-2.5 flex items-center justify-center gap-3">
                    <Star className="h-4 w-4 text-arrc-gold" />
                    <span className="text-arrc-gold font-heading font-bold text-sm tracking-[0.2em] uppercase">
                      Commander in Chief
                    </span>
                    <Star className="h-4 w-4 text-arrc-gold" />
                  </div>
                  <div className="flex flex-col md:flex-row">
                    {/* Leader photo */}
                    <div className="relative w-full md:w-80 h-72 md:h-auto min-h-[300px] overflow-hidden bg-gradient-to-br from-arrc-950 to-arrc-900 shrink-0">
                      {featuredLeader.image ? (
                        <Image
                          src={featuredLeader.image}
                          alt={featuredLeader.name}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 768px) 100vw, 320px"
                          priority
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[288px]">
                          <Star className="h-20 w-20 text-arrc-gold/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-arrc-950/20" />
                      {/* Role badge on photo */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-arrc-gold px-4 py-1.5 text-xs font-bold text-arrc-950 shadow-lg font-heading tracking-wider">
                          <Star className="h-3.5 w-3.5" />
                          {featuredLeader.badge}
                        </span>
                      </div>
                    </div>
                    {/* Leader info — NAME is the hero */}
                    <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                      {/* NAME — massive, gold-accented, impossible to miss */}
                      <h3 className="font-heading font-extrabold text-white text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-1 tracking-tight"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                      >
                        {featuredLeader.name}
                      </h3>
                      {/* Gold divider */}
                      <div className="my-4 h-[3px] w-24 bg-gradient-to-r from-arrc-gold to-arrc-gold/20 rounded-full" />
                      {featuredLeader.bio && (
                        <div className="relative">
                          <p className="text-sm md:text-base text-white/70 leading-relaxed line-clamp-6">
                            {featuredLeader.bio}
                          </p>
                          <span className="mt-2 inline-block text-sm font-medium text-arrc-gold hover:text-arrc-gold/80 transition-colors">
                            Read more →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                SENIOR NEC MEMBERS
                Name OVERLAID on photo bottom with strong gradient backdrop
            ═══════════════════════════════════════════════════════════ */}
            {seniorLeaders.length > 0 && (
              <>
                {/* Decorative gold gradient line */}
                <div className="my-8 h-0.5 bg-gradient-to-r from-transparent via-arrc-gold/50 to-transparent" />

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-2"
                >
                  <h3 className="text-center text-white/40 text-xs font-heading tracking-[0.3em] uppercase mb-8">
                    Senior Leadership
                  </h3>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {seniorLeaders.map((leader, i) => {
                    const vacant = isVacant(leader);
                    const Icon = getBadgeIcon(leader.badge);
                    const rank = getRoleRank(leader.badge);

                    return (
                      <motion.div
                        key={leader.badge + i}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: i * 0.12 }}
                      >
                        <TiltCard className="h-full">
                          <div
                            className={`flex flex-col h-full rounded-2xl overflow-hidden bg-gradient-to-b from-arrc-900 to-arrc-950 border border-white/5 ${!vacant ? "cursor-pointer" : ""}`}
                            onClick={() => !vacant && setSelectedLeader(leader)}
                          >
                            {/* Photo area with name overlaid */}
                            <div className="relative h-72 overflow-hidden bg-arrc-950">
                              {leader.image ? (
                                <Image
                                  src={leader.image}
                                  alt={leader.name}
                                  fill
                                  className="object-cover object-top"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  {vacant ? (
                                    <UserCircle className="h-16 w-16 text-white/20" />
                                  ) : (
                                    <Icon className="h-16 w-16 text-arrc-gold/30" />
                                  )}
                                </div>
                              )}
                              {/* Strong gradient for name readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-arrc-950 via-arrc-950/40 to-transparent" />

                              {/* Role badge — top left */}
                              <div className="absolute top-3 left-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-arrc-gold px-3 py-1 text-[11px] font-bold text-arrc-950 font-heading tracking-wider shadow-lg">
                                  <Icon className="h-3 w-3" />
                                  {leader.badge}
                                </span>
                              </div>
                              {/* Rank badge — top right */}
                              {rank && (
                                <div className="absolute top-3 right-3">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-[9px] font-bold text-white/40 font-heading">
                                    {String(rank).padStart(2, "0")}
                                  </span>
                                </div>
                              )}
                              {vacant && (
                                <div className="absolute top-3 right-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                                    Vacant
                                  </span>
                                </div>
                              )}

                              {/* ★★★ NAME OVERLAID ON PHOTO — BIG, BOLD, UNMISSABLE ★★★ */}
                              <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
                                <h3 className={`font-heading font-extrabold text-3xl sm:text-4xl leading-tight ${vacant ? "text-white/40" : "text-white"}`}
                                  style={{ textShadow: "0 3px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)" }}
                                >
                                  {vacant ? "To Be Announced" : leader.name}
                                </h3>
                                {/* Gold accent line under name */}
                                {!vacant && (
                                  <div className="mt-2 h-[2px] w-14 bg-arrc-gold rounded-full" />
                                )}
                              </div>
                            </div>
                            {/* Bio section below photo */}
                            {leader.bio && (
                              <div className="px-5 py-4 flex-1">
                                <p className={`text-sm line-clamp-3 leading-relaxed ${vacant ? "text-white/30" : "text-white/60"}`}>
                                  {leader.bio}
                                </p>
                                {!vacant && (
                                  <span className="mt-2 inline-block text-sm font-medium text-arrc-gold hover:text-arrc-gold/80 transition-colors">
                                    Read more →
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Bottom decorative line */}
                            <div className="mx-5 h-[2px] bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent rounded-full" />
                            <div className="h-3" />
                          </div>
                        </TiltCard>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════
                YOUTH LEADERSHIP
                Same name-overlaid-on-photo design
            ═══════════════════════════════════════════════════════════ */}
            {youthLeaders.length > 0 && (
              <>
                {/* Decorative gold gradient line */}
                <div className="my-10 h-0.5 bg-gradient-to-r from-transparent via-arrc-gold/50 to-transparent" />

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-2"
                >
                  <h3 className="text-center text-white/40 text-xs font-heading tracking-[0.3em] uppercase mb-8 flex items-center justify-center gap-2">
                    <Flame className="h-4 w-4 text-arrc-gold/60" />
                    Youth Leadership
                    <Flame className="h-4 w-4 text-arrc-gold/60" />
                  </h3>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
                  {youthLeaders.map((leader, i) => {
                    const vacant = isVacant(leader);
                    const Icon = getBadgeIcon(leader.badge);

                    return (
                      <motion.div
                        key={leader.badge + i}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: i * 0.12 }}
                      >
                        <TiltCard className="h-full">
                          <div
                            className={`flex flex-col h-full rounded-2xl overflow-hidden bg-gradient-to-b from-arrc-900 to-arrc-950 border border-white/5 border-t-2 border-t-arrc-gold/30 cursor-pointer`}
                            onClick={() => setSelectedLeader(leader)}
                          >
                            {/* Photo area with name overlaid */}
                            <div className="relative h-72 overflow-hidden bg-arrc-950">
                              {leader.image ? (
                                <Image
                                  src={leader.image}
                                  alt={leader.name}
                                  fill
                                  className="object-cover object-top"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Flame className="h-16 w-16 text-arrc-gold/30" />
                                </div>
                              )}
                              {/* Strong gradient for name readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-arrc-950 via-arrc-950/40 to-transparent" />
                              {/* Role badge — top left */}
                              <div className="absolute top-3 left-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-arrc-gold px-3 py-1 text-[11px] font-bold text-arrc-950 font-heading tracking-wider shadow-lg">
                                  <Icon className="h-3 w-3" />
                                  {leader.badge}
                                </span>
                              </div>
                              {/* ★★★ NAME OVERLAID ON PHOTO — BIG, BOLD, UNMISSABLE ★★★ */}
                              <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
                                <h3 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight text-white"
                                  style={{ textShadow: "0 3px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)" }}
                                >
                                  {leader.name}
                                </h3>
                                {/* Gold accent line under name */}
                                <div className="mt-2 h-[2px] w-14 bg-arrc-gold rounded-full" />
                              </div>
                            </div>
                            {/* Bio section below photo */}
                            {leader.bio && (
                              <div className="px-5 py-4 flex-1">
                                <p className="text-sm line-clamp-3 text-white/60 leading-relaxed">
                                  {leader.bio}
                                </p>
                                <span className="mt-2 inline-block text-sm font-medium text-arrc-gold hover:text-arrc-gold/80 transition-colors">
                                  Read more →
                                </span>
                              </div>
                            )}
                            {/* Bottom decorative line */}
                            <div className="mx-5 h-[2px] bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent rounded-full" />
                            <div className="h-3" />
                          </div>
                        </TiltCard>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-arrc-gold/10">
              <Users className="h-8 w-8 text-arrc-gold" />
            </div>
            <p className="text-white/50 text-lg font-heading">Leadership profiles coming soon</p>
            <p className="text-white/30 text-sm mt-1">Our National Executive Committee will be announced shortly</p>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          LEADER BIO DIALOG
      ═══════════════════════════════════════════════════════════ */}
      <Dialog open={selectedLeader !== null} onOpenChange={(open) => { if (!open) setSelectedLeader(null); }}>
        <DialogContent
          className="bg-arrc-950 border-arrc-gold/30 text-white max-w-2xl p-0 overflow-hidden"
          showCloseButton={false}
        >
          {selectedLeader && (() => {
            const Icon = getBadgeIcon(selectedLeader.badge);
            const vacant = isVacant(selectedLeader);
            return (
              <div className="flex flex-col md:flex-row">
                {/* Leader photo — left on desktop, top on mobile */}
                <div className="relative w-full md:w-72 h-64 md:h-auto md:min-h-[400px] overflow-hidden bg-gradient-to-br from-arrc-950 to-arrc-900 shrink-0">
                  {selectedLeader.image ? (
                    <Image
                      src={selectedLeader.image}
                      alt={selectedLeader.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 288px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[256px]">
                      <Icon className="h-20 w-20 text-arrc-gold/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-arrc-950/30" />
                  {/* Role badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-arrc-gold px-3 py-1 text-xs font-bold text-arrc-950 shadow-lg font-heading tracking-wider">
                      <Icon className="h-3.5 w-3.5" />
                      {selectedLeader.badge}
                    </span>
                  </div>
                </div>

                {/* Leader details */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedLeader(null)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors p-1.5 text-white/60 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <DialogHeader className="text-left mb-4">
                    <DialogTitle className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white leading-tight">
                      {vacant ? "To Be Announced" : selectedLeader.name}
                    </DialogTitle>
                    <div className="mt-2 h-[2px] w-14 bg-arrc-gold rounded-full" />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-arrc-gold/15 border border-arrc-gold/30 px-3 py-1 text-xs font-bold text-arrc-gold font-heading tracking-wider w-fit mt-2">
                      <Icon className="h-3 w-3" />
                      {selectedLeader.badge}
                    </span>
                  </DialogHeader>

                  {/* Full bio — no truncation, prefer content field */}
                  {(selectedLeader.fullBio || selectedLeader.bio) && (
                    <div className="flex-1 overflow-y-auto max-h-[50vh] md:max-h-[400px] pr-1 custom-scrollbar">
                      <p className="text-sm md:text-base text-white/70 leading-relaxed whitespace-pre-line">
                        {selectedLeader.fullBio || selectedLeader.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Custom scrollbar styles for the dialog */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 168, 67, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 168, 67, 0.5);
        }
      `}</style>
    </section>
  );
}
