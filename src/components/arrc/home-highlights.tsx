"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchContent } from "@/lib/content-client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ScrollText,
  Check,
  Crown,
  Users,
  Star,
  UserCircle,
  CalendarDays,
  Calendar,
  MapPin,
  Newspaper,
  ImageIcon,
  Shield,
  Flame,
  Clock,
  FileText,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Types ─── */
interface PolicyPreview {
  id: string;
  title: string;
  image: string;
  bullets: string[];
}

interface LeaderPreview {
  image: string;
  badge: string;
  name: string;
  bio: string;
  featured: boolean;
}

interface NewsPreview {
  image: string;
  title: string;
  excerpt: string;
  date: string;
}

interface EventPreview {
  title: string;
  location: string;
  date: string;
  description: string;
  image: string;
}

interface GalleryPreview {
  src: string;
  alt: string;
  caption: string;
}

/* ─── Badge icon helper ─── */
function getBadgeIcon(badge: string) {
  const lower = badge.toLowerCase();
  if (lower.includes("president") && !lower.includes("vice") && !lower.includes("youth")) return Star;
  if (lower.includes("vice president")) return Shield;
  if (lower.includes("chairperson") || lower.includes("chair")) return Crown;
  return UserCircle;
}

/* ─── Parse date for event cards ─── */
function parseDateParts(dateStr: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: "", month: dateStr.slice(0, 3), full: dateStr };
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase(),
      full: d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }),
    };
  } catch {
    return null;
  }
}

/* ─── Section animation variants ─── */
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ─── Component ─── */
interface HomeHighlightsProps {
  onNavigate: (view: string) => void;
}

export function HomeHighlights({ onNavigate }: HomeHighlightsProps) {
  const [policies, setPolicies] = useState<PolicyPreview[]>([]);
  const [leaders, setLeaders] = useState<LeaderPreview[]>([]);
  const [newsItems, setNewsItems] = useState<NewsPreview[]>([]);
  const [events, setEvents] = useState<EventPreview[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryPreview[]>([]);

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.policies) {
          setPolicies(
            data.policies.slice(0, 3).map((item: Record<string, unknown>) => {
              const metadata = (item.metadata as Record<string, unknown>) || {};
              return {
                id: item.id as string,
                title: item.title as string,
                image: (item.imageUrl as string) || "",
                bullets: (metadata.bullets as string[]) || [],
              };
            })
          );
        }
        if (data.leaders) {
          setLeaders(
            data.leaders.map((item: Record<string, unknown>) => ({
              image: (item.imageUrl as string) || "",
              badge: (item.subtitle as string) || "Leader",
              name: item.title as string,
              bio: (item.description as string) || "",
              featured: (item.featured as boolean) || false,
            }))
          );
        }
        if (data.news) {
          setNewsItems(
            data.news.slice(0, 2).map((item: Record<string, unknown>) => ({
              image: (item.imageUrl as string) || "",
              title: item.title as string,
              excerpt: (item.subtitle as string) || (item.description as string) || "",
              date: (item.date as string) || "",
            }))
          );
        }
        if (data.events) {
          setEvents(
            data.events.slice(0, 4).map((item: Record<string, unknown>) => ({
              title: item.title as string,
              location: (item.location as string) || "",
              date: (item.date as string) || "",
              description: (item.description as string) || "",
              image: (item.imageUrl as string) || "",
            }))
          );
        }
        if (data.gallery) {
          setGalleryItems(
            data.gallery.slice(0, 4).map((item: Record<string, unknown>) => {
              const metadata = (item.metadata as Record<string, unknown>) || {};
              return {
                src: (item.imageUrl as string) || "",
                alt: item.title as string,
                caption: (item.description as string) || "",
                badge: (metadata.badge as string) || undefined,
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  const featuredLeader = leaders.find((l) => l.featured);

  return (
    <section className="py-20 bg-gradient-to-b from-[#faf8f2] via-white to-[#faf8f2] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-arrc-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.02]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-arrc-950 font-heading">
            Explore The Movement
          </h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-arrc-gold/40" />
            <span className="text-arrc-gold text-xs">&#9670;</span>
            <div className="h-px w-12 bg-arrc-gold/40" />
          </div>
          <div className="mt-2 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Discover our policies, meet our leaders, and stay informed about the latest news and events.
          </p>
        </motion.div>

        {/* ─── Policies Preview ─── */}
        {policies.length > 0 && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-arrc-gold" />
                <h3 className="text-xl font-heading font-bold text-arrc-950">Our Policies</h3>
              </div>
              <button
                onClick={() => onNavigate("policies")}
                className="group inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors"
              >
                View All Policies
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {policies.map((policy, i) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group cursor-pointer"
                  onClick={() => onNavigate("policies")}
                >
                  <div className="card-premium overflow-hidden border-t-4 border-t-arrc-gold h-full">
                    <div className="relative h-36 overflow-hidden bg-arrc-950 img-zoom">
                      {policy.image ? (
                        <Image
                          src={policy.image}
                          alt={policy.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ScrollText className="h-10 w-10 text-arrc-gold/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/70 via-arrc-950/30 to-transparent pointer-events-none" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-arrc-gold/10">
                          <ScrollText className="h-3.5 w-3.5 text-arrc-gold" />
                        </div>
                        <h4 className="font-bold font-heading text-arrc-950 text-sm">{policy.title}</h4>
                      </div>
                      <div className="h-px w-10 bg-gradient-to-r from-arrc-gold/60 to-transparent mb-2" />
                      {policy.bullets.length > 0 ? (
                        <ul className="space-y-1">
                          {policy.bullets.slice(0, 2).map((bullet) => (
                            <li key={bullet} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <Check className="h-3 w-3 text-arrc-gold mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500">Click to learn more</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── NEC Featured Leader + Gallery Preview ─── */}
        <div className="grid gap-8 lg:grid-cols-2 mb-14">
          {/* NEC Preview */}
          {featuredLeader && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-arrc-gold" />
                  <h3 className="text-xl font-heading font-bold text-arrc-950">Our Leadership</h3>
                </div>
                <button
                  onClick={() => onNavigate("nec")}
                  className="group inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors"
                >
                  View Full NEC
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div
                className="card-premium overflow-hidden border-2 border-arrc-gold/30 cursor-pointer group"
                onClick={() => onNavigate("nec")}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-40 h-48 sm:h-auto overflow-hidden bg-arrc-950 shrink-0">
                    {featuredLeader.image ? (
                      <Image
                        src={featuredLeader.image}
                        alt={featuredLeader.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 160px"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[192px]">
                        <Star className="h-12 w-12 text-arrc-gold/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />
                  </div>
                  <div className="p-5 flex-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-arrc-gold px-2.5 py-1 text-[10px] font-bold text-arrc-950 font-heading tracking-wider mb-3">
                      <Star className="h-3 w-3" />
                      {featuredLeader.badge}
                    </span>
                    <h4 className="font-heading font-extrabold text-arrc-950 text-2xl leading-tight">
                      {featuredLeader.name}
                    </h4>
                    <div className="my-2 h-[2px] w-16 bg-gradient-to-r from-arrc-gold to-arrc-gold/20 rounded-full" />
                    {featuredLeader.bio && (
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {featuredLeader.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Gallery Preview */}
          {galleryItems.length > 0 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-arrc-gold" />
                  <h3 className="text-xl font-heading font-bold text-arrc-950">On The Ground</h3>
                </div>
                <button
                  onClick={() => onNavigate("gallery")}
                  className="group inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors"
                >
                  View Gallery
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {galleryItems.map((item, i) => (
                  <motion.div
                    key={item.src + i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="group cursor-pointer"
                    onClick={() => onNavigate("gallery")}
                  >
                    <div className="relative h-36 sm:h-40 rounded-xl overflow-hidden bg-arrc-950">
                      {item.src ? (
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 300px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-white/5">
                          <ImageIcon className="h-8 w-8 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/60 to-transparent pointer-events-none" />
                      {item.alt && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-[10px] font-semibold text-white/90 line-clamp-1 font-heading">
                            {item.alt}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── News + Events Side by Side ─── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* News Preview */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-arrc-gold" />
                <h3 className="text-xl font-heading font-bold text-arrc-950">Latest News</h3>
              </div>
              <button
                onClick={() => onNavigate("news")}
                className="group inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors"
              >
                View All News
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {newsItems.length > 0 ? (
              <div className="space-y-4">
                {newsItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="group cursor-pointer"
                    onClick={() => onNavigate("news")}
                  >
                    <div className="card-premium overflow-hidden flex border-l-4 border-l-arrc-gold">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden bg-arrc-50 shrink-0 img-zoom">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Newspaper className="h-6 w-6 text-arrc-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-arrc-gold font-semibold font-heading mb-1.5">
                          <CalendarDays className="h-3 w-3" />
                          {item.date}
                        </div>
                        <h4 className="font-bold font-heading text-arrc-950 text-sm line-clamp-2 group-hover:text-arrc-700 transition-colors">
                          {item.title}
                        </h4>
                        {item.excerpt && (
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{item.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="card-premium p-6 text-center">
                <Newspaper className="h-8 w-8 text-arrc-gold/40 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-heading">No news yet</p>
              </div>
            )}
          </motion.div>

          {/* Events Preview */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-arrc-gold" />
                <h3 className="text-xl font-heading font-bold text-arrc-950">Upcoming Events</h3>
              </div>
              <button
                onClick={() => onNavigate("events")}
                className="group inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors"
              >
                View All Events
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event, i) => {
                  const dateParts = parseDateParts(event.date);
                  return (
                    <motion.div
                      key={event.title + event.date}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="group cursor-pointer"
                      onClick={() => onNavigate("events")}
                    >
                      <div className="card-premium overflow-hidden flex items-center border-l-4 border-l-arrc-gold">
                        {/* Date block */}
                        {dateParts && dateParts.day ? (
                          <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-arrc-gold text-arrc-950 shadow-md m-3 sm:m-4">
                            <span className="text-lg font-bold leading-none font-heading">{dateParts.day}</span>
                            <span className="text-[9px] font-bold tracking-wider uppercase leading-none mt-0.5">{dateParts.month}</span>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-arrc-gold/10 text-arrc-gold m-3 sm:m-4">
                            <Calendar className="h-6 w-6" />
                          </div>
                        )}
                        <div className="p-3 sm:p-4 flex-1">
                          <h4 className="font-bold font-heading text-arrc-950 text-sm line-clamp-1 group-hover:text-arrc-700 transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {dateParts?.full && (
                              <div className="flex items-center gap-1 text-[10px] text-arrc-gold font-semibold font-heading">
                                <CalendarDays className="h-3 w-3" />
                                {dateParts.full}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="card-premium p-6 text-center">
                <CalendarDays className="h-8 w-8 text-arrc-gold/40 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-heading">No upcoming events</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Documents Preview ─── */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-14"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-arrc-gold" />
              <h3 className="text-xl font-heading font-bold text-arrc-950">Official Documents</h3>
            </div>
            <button
              onClick={() => onNavigate("documents")}
              className="group inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors"
            >
              View All Documents
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.4 }}
              className="group cursor-pointer"
              onClick={() => onNavigate("documents")}
            >
              <div className="card-premium overflow-hidden border-l-4 border-l-arrc-gold flex items-center p-5 gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-arrc-gold/10 border border-arrc-gold/20 shrink-0 group-hover:bg-arrc-gold/20 transition-colors">
                  <Scale className="h-7 w-7 text-arrc-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-arrc-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-arrc-gold tracking-wider uppercase mb-1.5">
                    Governance
                  </span>
                  <h4 className="font-bold font-heading text-arrc-950 text-sm group-hover:text-arrc-700 transition-colors">
                    ARRC Constitution
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    Our founding framework for governance, democracy, and organisational structure.
                  </p>
                </div>
                <FileText className="h-5 w-5 text-arrc-gold/40 shrink-0 group-hover:text-arrc-gold transition-colors" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="group cursor-pointer"
              onClick={() => onNavigate("documents")}
            >
              <div className="card-premium overflow-hidden border-l-4 border-l-arrc-gold flex items-center p-5 gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-arrc-gold/10 border border-arrc-gold/20 shrink-0 group-hover:bg-arrc-gold/20 transition-colors">
                  <ScrollText className="h-7 w-7 text-arrc-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-arrc-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-arrc-gold tracking-wider uppercase mb-1.5">
                    Policy
                  </span>
                  <h4 className="font-bold font-heading text-arrc-950 text-sm group-hover:text-arrc-700 transition-colors">
                    Finance & Admin Policy
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    Ensuring transparency, accountability, and proper management of resources.
                  </p>
                </div>
                <FileText className="h-5 w-5 text-arrc-gold/40 shrink-0 group-hover:text-arrc-gold transition-colors" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
