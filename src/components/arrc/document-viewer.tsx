"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  X,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Shield,
  ScrollText,
  Scale,
  Eye,
  AlertCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Document data type ─── */
export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  icon: React.ElementType;
  category: string;
}

/* ─── Default documents ─── */
const defaultDocuments: DocumentItem[] = [
  {
    id: "constitution",
    title: "ARRC Constitution",
    description:
      "The founding constitution of the African Royal Rainbow Congress — our guiding framework for governance, democracy, and organisational structure.",
    pdfUrl: "/api/documents?id=constitution",
    icon: Scale,
    category: "Governance",
  },
  {
    id: "arrc-2026-manifesto",
    title: "ARRC 2026 Manifesto",
    description:
      "The official 2026 Manifesto of the African Royal Rainbow Congress — our vision and plan for a better South Africa.",
    pdfUrl: "/api/documents?id=arrc-2026-manifesto",
    icon: ScrollText,
    category: "Manifesto",
  },
  {
    id: "finance-admin-policy",
    title: "Finance & Admin Policy",
    description:
      "The financial administration policy of the ARRC — ensuring transparency, accountability, and proper management of organisational resources.",
    pdfUrl: "/api/documents?id=finance-admin-policy",
    icon: ScrollText,
    category: "Policy",
  },
  {
    id: "draft-admin-policy",
    title: "Draft Admin Policy",
    description:
      "The draft administrative policy of the ARRC — outlining procedures and governance for effective organisational administration.",
    pdfUrl: "/api/documents?id=draft-admin-policy",
    icon: ScrollText,
    category: "Policy",
  },
  {
    id: "members-code",
    title: "Members Code of Conduct",
    description:
      "The code of conduct for all ARRC members — defining the standards of behaviour, integrity, and accountability expected of every member.",
    pdfUrl: "/api/documents?id=members-code",
    icon: Shield,
    category: "Governance",
  },
];

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

/* ─── PDF.js type helpers ─── */
interface PDFPageProxy {
  getViewport(opts: { scale: number; rotation: number }): {
    width: number;
    height: number;
  };
  render(opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
}

interface PDFDocProxy {
  numPages: number;
  getPage(n: number): Promise<PDFPageProxy>;
  destroy(): void;
}

interface PDFJSLib {
  getDocument(opts: { url: string; useSystemFonts?: boolean }): {
    promise: Promise<PDFDocProxy>;
  };
  GlobalWorkerOptions: { workerSrc: string };
}

/* ─── Secure PDF Viewer Modal ─── */
export function SecurePdfViewer({
  document: doc,
  onClose,
}: {
  document: DocumentItem;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pdfJsReady, setPdfJsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocProxy | null>(null);
  const renderVersionRef = useRef(0);
  const pdfJsRef = useRef<PDFJSLib | null>(null);

  // Load PDF.js library once
  useEffect(() => {
    let cancelled = false;

    async function loadPdfJs() {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (cancelled) return;

        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfJsRef.current = pdfjs as unknown as PDFJSLib;
        setPdfJsReady(true);
      } catch (err) {
        console.error("Failed to load PDF.js:", err);
        if (!cancelled) {
          setError("Failed to load PDF viewer. Please try again.");
          setLoading(false);
        }
      }
    }

    loadPdfJs();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the PDF document once (after PDF.js is ready)
  useEffect(() => {
    if (!pdfJsReady || !pdfJsRef.current) return;

    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);

      try {
        const pdfjs = pdfJsRef.current!;
        const loadingTask = pdfjs.getDocument({
          url: doc.pdfUrl,
          useSystemFonts: true,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load PDF:", err);
          setError("Failed to load document. Please try again.");
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch {
          // ignore
        }
        pdfDocRef.current = null;
      }
      setTotalPages(0);
      setCurrentPage(1);
    };
  }, [doc.pdfUrl, pdfJsReady]);

  // Render pages whenever PDF doc, scale, or rotation changes
  useEffect(() => {
    const pdf = pdfDocRef.current;
    if (!pdf || !canvasContainerRef.current) return;

    const version = ++renderVersionRef.current;
    let cancelled = false;

    // Clear previous canvases
    canvasContainerRef.current.innerHTML = "";

    async function renderAllPages() {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled || renderVersionRef.current !== version) break;

        try {
          const page = await pdf.getPage(pageNum);
          if (cancelled || renderVersionRef.current !== version) break;

          const viewport = page.getViewport({ scale, rotation });
          const dpr = window.devicePixelRatio || 1;

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = "auto";
          canvas.style.maxWidth = "100%";
          canvas.dataset.page = String(pageNum);

          const ctx = canvas.getContext("2d");
          if (!ctx || cancelled || renderVersionRef.current !== version) break;

          ctx.scale(dpr, dpr);

          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;

          if (cancelled || renderVersionRef.current !== version) break;

          // Page number label
          const pageLabel = document.createElement("div");
          pageLabel.style.cssText =
            "position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border-radius:4px;padding:2px 8px;font-size:10px;color:rgba(255,255,255,0.5);font-family:monospace;";
          pageLabel.textContent = `${pageNum} / ${pdf.numPages}`;

          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "position:relative;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;";
          wrapper.appendChild(canvas);
          wrapper.appendChild(pageLabel);

          if (canvasContainerRef.current && !cancelled && renderVersionRef.current === version) {
            canvasContainerRef.current.appendChild(wrapper);
          }
        } catch (err) {
          console.error(`Failed to render page ${pageNum}:`, err);
        }
      }
    }

    renderAllPages();

    return () => {
      cancelled = true;
    };
  }, [scale, rotation, totalPages]);

  // Track current page from scroll position
  useEffect(() => {
    if (!containerRef.current || totalPages === 0) return;

    const container = containerRef.current;

    function handleScroll() {
      const canvases = container.querySelectorAll("canvas");
      if (canvases.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const midY = containerRect.top + containerRect.height / 3;

      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        const rect = canvas.getBoundingClientRect();
        if (rect.top <= midY && rect.bottom >= midY) {
          setCurrentPage(i + 1);
          break;
        }
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  // Block right-click, keyboard shortcuts
  useEffect(() => {
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")
      ) {
        e.preventDefault();
      }
    }

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const goToPage = (page: number) => {
    if (!containerRef.current || page < 1 || page > totalPages) return;
    const canvases = containerRef.current.querySelectorAll("canvas");
    const targetCanvas = canvases[page - 1];
    if (targetCanvas) {
      targetCanvas.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-arrc-950/95 backdrop-blur-md flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-arrc-950 border-b border-arrc-gold/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arrc-gold/10 border border-arrc-gold/20">
            <doc.icon className="h-5 w-5 text-arrc-gold" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-white text-base sm:text-lg">
              {doc.title}
            </h2>
            <p className="text-[11px] text-white/40 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Read-only document — not downloadable
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Page navigation */}
          {totalPages > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1 border border-white/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/50 font-mono w-16 text-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1 border border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-white/50 font-mono w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
              title="Reset view"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto"
        onContextMenu={(e) => e.preventDefault()}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(212,168,67,0.3) transparent",
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <Loader2 className="h-10 w-10 text-arrc-gold animate-spin" />
            <p className="text-white/50 text-sm">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-white/70 text-sm">{error}</p>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        )}

        {/* Canvas pages container */}
        <div
          ref={canvasContainerRef}
          className="flex flex-col items-center gap-4 py-6 px-4"
        />

        {/* Watermark overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 200px, rgba(212,168,67,0.015) 200px, rgba(212,168,67,0.015) 201px)",
          }}
        />
      </div>

      {/* Mobile controls */}
      <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-arrc-950/80 border-t border-arrc-gold/10 shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-white/50 font-mono w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {totalPages > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-white/50 font-mono">
              {currentPage}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-arrc-950 border-t border-arrc-gold/20 shrink-0">
        <p className="text-[11px] text-white/30">
          African Royal Rainbow Congress — {doc.category}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-3 py-1">
            <Shield className="h-3 w-3 text-arrc-gold" />
            <span className="text-[10px] font-semibold text-arrc-gold tracking-wider uppercase">
              Protected Document
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Documents Section ─── */
export function DocumentViewer() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [documents] = useState<DocumentItem[]>(defaultDocuments);

  return (
    <section
      id="documents"
      className="py-20 bg-gradient-to-b from-arrc-950 via-arrc-900 to-arrc-950 relative overflow-hidden"
    >
      {/* Gold glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-arrc-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-arrc-gold/3 rounded-full blur-[100px] pointer-events-none" />
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
          <div className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4">
            <Shield className="h-4 w-4 text-arrc-gold" />
            <span className="text-sm font-semibold text-arrc-gold font-heading">
              Official Documents
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-heading">
            Governance &amp; Policy Documents
          </h2>
          <div className="mt-3 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Access the official founding documents and policies of the African
            Royal Rainbow Congress. These documents are available for viewing
            only and may not be downloaded or reproduced without authorisation.
          </p>
        </motion.div>

        {/* Document Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {documents.map((doc, i) => {
            const Icon = doc.icon;
            return (
              <motion.div
                key={doc.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6 }}
                transition={{ y: { duration: 0.3, ease: "easeOut" } }}
                className="group cursor-pointer"
              >
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left h-full rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-arrc-gold/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-arrc-gold/10"
                >
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-arrc-gold/60 via-arrc-gold to-arrc-gold/60" />

                  <div className="p-6 sm:p-8">
                    {/* Icon and category */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-arrc-gold/10 border border-arrc-gold/20 group-hover:bg-arrc-gold/20 transition-colors">
                        <Icon className="h-7 w-7 text-arrc-gold" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-semibold text-white/40 tracking-wider uppercase">
                        <Eye className="h-3 w-3" />
                        Read only
                      </span>
                    </div>

                    {/* Category badge */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-arrc-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-arrc-gold tracking-wider uppercase mb-3">
                      {doc.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-white text-xl mb-3 group-hover:text-arrc-gold transition-colors">
                      {doc.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-5">
                      {doc.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-arrc-gold font-heading font-semibold text-sm group-hover:gap-3 transition-all">
                      <FileText className="h-4 w-4" />
                      View Document
                      <ChevronRight className="h-4 w-4" />
                    </div>

                    {/* Bottom decorative line */}
                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent" />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 flex gap-4">
            <AlertCircle className="h-5 w-5 text-arrc-gold/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/40 leading-relaxed">
                These documents are the property of the African Royal Rainbow
                Congress and are made available for public viewing in the
                interest of transparency and good governance. They may not be
                downloaded, reproduced, or distributed without the express
                written consent of the ARRC National Executive Committee.
                Unauthorised reproduction is prohibited under the ARRC
                Constitution and applicable South African law.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secure PDF Viewer Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <SecurePdfViewer
            document={selectedDoc}
            onClose={() => setSelectedDoc(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
