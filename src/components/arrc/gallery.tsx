"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { fetchContent } from "@/lib/content-client";
import { motion, useInView } from "framer-motion";
import { ImageIcon } from "lucide-react";

/* ─── Data type ─── */
type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  badge?: string;
};

const headingVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.gallery) {
          setGalleryItems(
            data.gallery.map((item: Record<string, unknown>) => {
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

  return (
    <section id="gallery" className="py-20 bg-arrc-950 overflow-hidden relative">
      {/* Subtle gold gradient glow in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-arrc-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div ref={sectionRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <h2 className="text-4xl font-bold text-white sm:text-5xl font-heading">
            On The Ground
          </h2>
          <span className="block mt-3 text-arrc-gold text-sm">◆</span>
          <div className="mt-2 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
        </motion.div>

        {galleryItems.length > 0 ? (
          <div className="relative">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-arrc-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-arrc-950 to-transparent" />

            <div className="flex gap-6 overflow-x-auto pb-4 px-2 custom-scrollbar snap-x snap-mandatory scrollbar-hide">
              {galleryItems.map((item, i) => (
                <div key={item.src + i} className="snap-start shrink-0">
                  <button
                    onClick={() => setSelectedImage(item)}
                    className="group block w-72 sm:w-80 rounded-2xl overflow-hidden card-premium-dark cursor-pointer"
                  >
                    <div className="relative h-52 overflow-hidden img-zoom">
                      {item.src ? (
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 320px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-white/5">
                          <ImageIcon className="h-10 w-10 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/70 to-transparent" />
                      {item.badge && (
                        <div className="absolute top-3 left-3 rounded-full bg-arrc-gold/90 px-2.5 py-1 text-xs font-bold text-arrc-950 font-heading tracking-wider">
                          {item.badge}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white/5">
                      <h4 className="text-sm font-semibold text-white line-clamp-1 font-heading">{item.alt}</h4>
                      {item.caption && (
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">{item.caption}</p>
                      )}
                      {/* Subtle gold gradient line below caption */}
                      <div className="h-px w-full mt-3 bg-gradient-to-r from-transparent via-arrc-gold/40 to-transparent" />
                    </div>
                  </button>
                </div>
              ))}
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
              <ImageIcon className="h-10 w-10 text-arrc-gold" />
            </div>
            <p className="text-white/50 text-lg font-heading">No gallery images yet</p>
            <p className="text-white/30 text-sm mt-1">Photos from events and campaigns will appear here</p>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-arrc-950/95 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {selectedImage.src && (
              <div className="relative w-full h-[80vh] rounded-xl border-2 border-arrc-gold/30 overflow-hidden">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            )}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-white font-heading">{selectedImage.alt}</h3>
              {selectedImage.caption && (
                <p className="text-sm text-white/60 mt-1">{selectedImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
