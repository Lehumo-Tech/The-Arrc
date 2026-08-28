"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { fetchContent } from "@/lib/content-client";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Play,
  X,
  Video,
  Film,
} from "lucide-react";

/* ─── Video Data type ─── */
type VideoItem = {
  id: string;
  src: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  thumbnail: string;
  featured: boolean;
};

/* ─── Heading Variants ─── */
const headingVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ─── Main Section ─── */
export function VideoGallery() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(sectionRef, { once: true, amount: 0.1 });

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.videos) {
          setVideos(
            data.videos.map((item: Record<string, unknown>) => {
              const metadata = (item.metadata as Record<string, unknown>) || {};
              return {
                id: item.id as string,
                src: (metadata.videoUrl as string) || "",
                title: item.title as string,
                description: (item.description as string) || "",
                duration: (metadata.duration as string) || "",
                date: (item.date as string) || "",
                thumbnail: (metadata.thumbnailUrl as string) || (item.imageUrl as string) || "",
                featured: !!item.featured,
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  const featuredVideo = videos.find((v) => v.featured);
  const otherVideos = videos.filter((v) => !v.featured);

  const closeLightbox = () => {
    setActiveVideo(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      <section id="videos" className="py-20 bg-arrc-950 overflow-hidden relative">
        {/* Subtle African pattern overlay */}
        <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.02]" />
        <div ref={sectionRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            className="text-center mb-14"
            variants={headingVariants}
            initial="hidden"
            animate={headingInView ? "visible" : "hidden"}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4">
              <Video className="h-4 w-4 text-arrc-gold" />
              <span className="text-sm font-semibold text-arrc-gold font-heading">Watch & Engage</span>
            </div>
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-5xl tracking-tight font-heading">
              ARRC{" "}
              <span className="gradient-text font-heading">Video Gallery</span>
            </h2>
            <span className="block mt-3 text-arrc-gold text-sm">◆</span>
            <div className="mt-2 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
            <p className="mt-5 text-white/70 max-w-2xl mx-auto text-lg">
              Watch speeches, rallies, and community events. See the movement in action and hear from our leaders.
            </p>
          </motion.div>

          {videos.length > 0 ? (
            <>
              {/* Featured Video */}
              {featuredVideo && (
                <div className="mb-10">
                  <button
                    onClick={() => setActiveVideo(featuredVideo)}
                    className="group w-full text-left rounded-2xl overflow-hidden card-premium-dark cursor-pointer"
                  >
                    <div className="relative aspect-video overflow-hidden bg-white/5 img-zoom">
                      {featuredVideo.thumbnail ? (
                        <Image
                          src={featuredVideo.thumbnail}
                          alt={featuredVideo.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                          priority
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px]">
                          <Film className="h-16 w-16 text-arrc-gold/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-arrc-950/30 flex items-center justify-center group-hover:bg-arrc-950/40 transition-colors">
                        <div className="w-20 h-20 rounded-full bg-arrc-gold/90 hover:bg-arrc-gold flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg animate-pulse-glow">
                          <Play className="h-9 w-9 text-arrc-950 ml-1" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-heading">Featured</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5">
                      <h3 className="text-xl font-bold text-white mb-2 font-heading">{featuredVideo.title}</h3>
                      {featuredVideo.description && (
                        <p className="text-sm text-white/70 line-clamp-2">{featuredVideo.description}</p>
                      )}
                      {/* Gold gradient line below description */}
                      <div className="h-px w-full mt-4 bg-gradient-to-r from-transparent via-arrc-gold/40 to-transparent" />
                    </div>
                  </button>
                </div>
              )}

              {/* Other Videos Grid */}
              {otherVideos.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {otherVideos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className="group w-full text-left rounded-2xl overflow-hidden card-premium-dark cursor-pointer"
                    >
                      <div className="relative h-48 overflow-hidden bg-white/5 img-zoom">
                        {video.thumbnail ? (
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Film className="h-10 w-10 text-arrc-gold/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-arrc-950/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-arrc-gold/90 flex items-center justify-center shadow-lg animate-pulse-glow">
                            <Play className="h-6 w-6 text-arrc-950 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 rounded bg-arrc-950/80 px-2 py-0.5 text-xs text-white font-mono">
                            {video.duration}
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white/5">
                        <h4 className="text-sm font-semibold text-white line-clamp-2 font-heading">{video.title}</h4>
                        {video.date && (
                          <p className="text-xs text-white/70 mt-1">{video.date}</p>
                        )}
                        {/* Subtle gold gradient line at bottom of card */}
                        <div className="h-px w-full mt-3 bg-gradient-to-r from-transparent via-arrc-gold/40 to-transparent" />
                      </div>
                    </button>
                  ))}
                </div>
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
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-arrc-gold/10 animate-gold-ring-pulse">
                <Film className="h-10 w-10 text-arrc-gold" />
              </div>
              <p className="text-white/50 text-lg font-heading">No videos yet</p>
              <p className="text-white/30 text-sm mt-1">Videos from events and campaigns will appear here</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Video Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            onClick={closeLightbox}
          >
            <div className="absolute inset-0 bg-arrc-950/95 backdrop-blur-md" />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="relative z-10 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              {/* Gold top border on lightbox content */}
              <div className="rounded-t-xl overflow-hidden border-t-2 border-t-arrc-gold/50">
                {activeVideo.src ? (
                  <video
                    src={activeVideo.src}
                    controls
                    autoPlay
                    className="w-full"
                    poster={activeVideo.thumbnail}
                  />
                ) : (
                  <div className="aspect-video bg-white/5 flex items-center justify-center">
                    <div className="text-center">
                      <Film className="h-16 w-16 text-arrc-gold/30 mx-auto mb-4" />
                      <p className="text-white/50">Video source not available</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-white font-heading">{activeVideo.title}</h3>
                {activeVideo.description && (
                  <p className="text-sm text-white/60 mt-1">{activeVideo.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
