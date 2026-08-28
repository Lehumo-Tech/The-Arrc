"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { fetchContent } from "@/lib/content-client";
import { motion } from "framer-motion";
import { Calendar, MapPin, CalendarDays, Clock } from "lucide-react";

/* ─── Parse date string into displayable parts ─── */
function parseDateParts(dateStr: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try treating as a plain string display
      return { day: "", month: dateStr.slice(0, 3), year: "", full: dateStr };
    }
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase(),
      year: String(d.getFullYear()),
      full: d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }),
    };
  } catch {
    return { day: "", month: dateStr.slice(0, 3), year: "", full: dateStr };
  }
}

/* ─── Data type ─── */
type EventItem = {
  title: string;
  location: string;
  date: string;
  description: string;
  image: string;
  featured?: string;
};

/* ─── Card variants ─── */
const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ─── Section ─── */
export function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.events) {
          setEvents(
            data.events.map((item: Record<string, unknown>) => ({
              title: item.title as string,
              location: (item.location as string) || "",
              date: (item.date as string) || "",
              description: (item.description as string) || "",
              image: (item.imageUrl as string) || "",
              featured: item.featured ? String(item.featured) : undefined,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  return (
    <section id="events" className="py-20 bg-gradient-to-b from-[#faf8f2] via-white to-[#faf8f2] relative overflow-hidden">
      {/* African pattern overlay */}
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.02]" />
      {/* Warm gold glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-arrc-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4">
            <Clock className="h-4 w-4 text-arrc-gold" />
            <span className="text-sm font-semibold text-arrc-gold font-heading">Upcoming</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-arrc-950 font-heading">
            Events &amp; Gatherings
          </h2>
          <div className="mt-3 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Join us at community events, rallies, and organisational gatherings across South Africa.
          </p>
        </motion.div>

        {events.length > 0 ? (
          /* Timeline-style layout with horizontal event cards */
          <div className="relative">
            {/* Timeline line (desktop only) */}
            <div className="hidden lg:block absolute left-[88px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-arrc-gold/30 via-arrc-gold/50 to-arrc-gold/10" />

            <div className="space-y-6">
              {events.map((event, i) => {
                const dateParts = parseDateParts(event.date);

                return (
                  <motion.div
                    key={event.title + event.date}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="group"
                  >
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
                      {/* Date block */}
                      {dateParts && dateParts.day ? (
                        <div className="relative flex-shrink-0 flex items-start lg:items-center justify-center">
                          {/* Timeline dot (desktop) */}
                          <div className="hidden lg:flex absolute left-[81px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-arrc-gold border-4 border-[#faf8f2] z-10 shadow-md" />
                          <div className="flex flex-col items-center justify-center w-20 h-20 lg:w-[72px] lg:h-[72px] rounded-xl bg-arrc-gold text-arrc-950 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                            <span className="text-2xl font-bold leading-none font-heading">{dateParts.day}</span>
                            <span className="text-[10px] font-bold tracking-wider uppercase leading-none mt-0.5">{dateParts.month}</span>
                            <span className="text-[8px] text-arrc-950/60 leading-none mt-0.5">{dateParts.year}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex-shrink-0 flex items-start lg:items-center justify-center">
                          <div className="hidden lg:flex absolute left-[81px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-arrc-gold/50 border-4 border-[#faf8f2] z-10 shadow-md" />
                          <div className="flex items-center justify-center w-20 h-20 lg:w-[72px] lg:h-[72px] rounded-xl bg-arrc-gold/10 text-arrc-gold">
                            <Calendar className="h-8 w-8" />
                          </div>
                        </div>
                      )}

                      {/* Event card - horizontal layout */}
                      <div className="flex-1 card-premium overflow-hidden rounded-xl border-l-4 border-l-arrc-gold group-hover:border-l-arrc-gold group-hover:shadow-lg group-hover:shadow-arrc-gold/10 transition-all duration-300 mt-3 lg:mt-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Event image */}
                          {event.image && (
                            <div className="relative w-full sm:w-48 h-40 sm:h-auto overflow-hidden bg-arrc-950 img-zoom shrink-0">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 192px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />
                              {event.featured && (
                                <div className="absolute top-3 left-3 rounded-full bg-arrc-gold px-3 py-1 text-xs font-bold text-arrc-950">
                                  Featured
                                </div>
                              )}
                            </div>
                          )}
                          {/* Event details */}
                          <div className="p-5 sm:p-6 flex-1 flex flex-col">
                            <h3 className="font-bold font-heading text-arrc-950 text-lg mb-2 group-hover:text-arrc-700 transition-colors">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-4 mb-3 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs text-arrc-gold font-semibold font-heading">
                                <Calendar className="h-3.5 w-3.5" />
                                {dateParts?.full || event.date}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                                {event.description}
                              </p>
                            )}
                            {/* Gold gradient line at bottom */}
                            <div className="h-px w-full bg-gradient-to-r from-arrc-gold/40 via-arrc-gold/20 to-transparent mt-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-arrc-gold/10 animate-gold-ring-pulse">
              <CalendarDays className="h-10 w-10 text-arrc-gold" />
            </div>
            <p className="text-gray-500 text-lg font-heading">No upcoming events</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for event announcements</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
