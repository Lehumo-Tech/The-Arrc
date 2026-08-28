"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, ArrowUpRight, Play, Newspaper } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetchContent } from "@/lib/content-client";

/* ─── Video Card Component ─── */
function VideoCard({
  videoSrc,
  posterImage,
  title,
  excerpt,
  date,
  index,
}: {
  videoSrc: string;
  posterImage: string;
  title: string;
  excerpt: string;
  date: string;
  index: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    videoRef.current?.play();
  };

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -8 }}
      transition={{ y: { duration: 0.3, ease: "easeOut" } }}
      className="group cursor-pointer"
    >
      <div
        className="h-full card-premium overflow-hidden border-t-4 border-t-arrc-gold"
      >
        <div className="h-full rounded-2xl overflow-hidden">
          {/* Video */}
          <div className="relative h-48 sm:h-52 overflow-hidden bg-arrc-950 img-zoom">
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterImage}
              controls={isPlaying}
              playsInline
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Play button overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-arrc-950/40 pointer-events-none">
                <button
                  onClick={handlePlay}
                  className="w-16 h-16 rounded-full bg-arrc-gold/90 hover:bg-arrc-gold flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg pointer-events-auto"
                  aria-label="Play video"
                >
                  <Play className="h-7 w-7 text-arrc-950 ml-1" fill="currentColor" />
                </button>
              </div>
            )}

            {/* Video badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Video</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-1.5 text-xs text-arrc-gold font-semibold font-heading mb-3">
              <CalendarDays className="h-3.5 w-3.5" />
              {date}
            </div>
            <div className="h-px w-10 bg-gradient-to-r from-arrc-gold/60 to-transparent mb-3" />
            <h3 className="font-bold font-heading text-arrc-950 text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-arrc-700 transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {excerpt}
            </p>
            {/* Gold gradient line at bottom of content */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent mt-4" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Data types ─── */
type NewsItem = {
  image: string;
  title: string;
  excerpt: string;
  date: string;
};

type VideoItem = {
  videoSrc: string;
  posterImage: string;
  title: string;
  excerpt: string;
  date: string;
};

/* ─── Card variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ─── Section ─── */
export function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.news) {
          setNewsItems(
            data.news.map((item: Record<string, unknown>) => ({
              image: (item.imageUrl as string) || "",
              title: item.title as string,
              excerpt: (item.subtitle as string) || (item.description as string) || "",
              date: (item.date as string) || "",
            }))
          );
        }
        if (data.videos) {
          setVideoItems(
            data.videos.map((item: Record<string, unknown>) => {
              const metadata = (item.metadata as Record<string, unknown>) || {};
              return {
                videoSrc: (metadata.videoUrl as string) || "",
                posterImage: (item.imageUrl as string) || (metadata.thumbnailUrl as string) || "",
                title: item.title as string,
                excerpt: (item.description as string) || "",
                date: (item.date as string) || "",
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  const hasContent = newsItems.length > 0 || videoItems.length > 0;

  return (
    <section id="news" className="py-20 bg-gradient-to-b from-white via-arrc-50/20 to-white relative overflow-hidden">
      {/* African pattern overlay */}
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.02]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-arrc-950 font-heading">
            Latest News
          </h2>
          <span className="block mt-3 text-arrc-gold text-sm">◆</span>
          <div className="mt-2 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
        </motion.div>

        {hasContent ? (
          <>
            {/* Featured Video */}
            {videoItems.length > 0 && (
              <div className="mb-10">
                <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
                  {videoItems.map((video, i) => (
                    <VideoCard
                      key={video.title}
                      videoSrc={video.videoSrc}
                      posterImage={video.posterImage}
                      title={video.title}
                      excerpt={video.excerpt}
                      date={video.date}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* News Cards */}
            {newsItems.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {newsItems.map((item, i) => (
                  <motion.article
                    key={item.title}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    whileHover={{ y: -8 }}
                    transition={{
                      y: { duration: 0.3, ease: "easeOut" },
                    }}
                    className="group cursor-pointer"
                  >
                    <div
                      className="h-full card-premium overflow-hidden border-t-4 border-t-arrc-gold"
                    >
                      <div className="h-full rounded-2xl overflow-hidden">
                        {/* Image */}
                        <div className="relative h-48 sm:h-52 overflow-hidden bg-arrc-50 img-zoom">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Newspaper className="h-12 w-12 text-arrc-200" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/50 to-transparent pointer-events-none" />

                          {/* Arrow icon */}
                          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <ArrowUpRight className="h-4 w-4 text-arrc-950" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Date */}
                          <div className="flex items-center gap-1.5 text-xs text-arrc-gold font-semibold font-heading mb-3">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {item.date}
                          </div>
                          <div className="h-px w-10 bg-gradient-to-r from-arrc-gold/60 to-transparent mb-3" />

                          {/* Title */}
                          <h3 className="font-bold font-heading text-arrc-950 text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-arrc-700 transition-colors duration-200">
                            {item.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {item.excerpt}
                          </p>

                          {/* Gold gradient line at bottom of content */}
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent mt-4" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
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
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-arrc-gold/10 animate-subtle-breathe">
              <Newspaper className="h-10 w-10 text-arrc-gold" />
            </div>
            <p className="text-gray-500 text-lg font-heading">No news articles yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for the latest updates</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
