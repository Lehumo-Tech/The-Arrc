"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, X, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://arrc.co.za";

function downloadCanvasAsPNG(srcCanvas: HTMLCanvasElement) {
  // Create a higher-res version with padding and branding
  const size = 1024;
  const padding = 80;
  const totalSize = size + padding * 2;
  const downloadCanvas = document.createElement("canvas");
  downloadCanvas.width = totalSize;
  downloadCanvas.height = totalSize + 60; // extra space for URL text
  const ctx = downloadCanvas.getContext("2d");
  if (!ctx) return;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

  // Draw QR code scaled up
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcCanvas, padding, padding, size, size);

  // Add URL text at bottom
  ctx.fillStyle = "#0f2b46";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("arrc.co.za", totalSize / 2, size + padding + 40);

  // Download
  const a = document.createElement("a");
  a.download = "ARRC-QR-Code.png";
  a.href = downloadCanvas.toDataURL("image/png");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function QRCodeButton() {
  const [open, setOpen] = useState(false);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = useCallback(() => {
    // Use the hidden high-res canvas for download
    const srcCanvas = hiddenCanvasRef.current;
    if (srcCanvas) {
      downloadCanvasAsPNG(srcCanvas);
      return;
    }
    // Fallback: try to find visible canvas
    const visibleCanvas = document.querySelector(
      "#arrc-qr-visible canvas"
    ) as HTMLCanvasElement | null;
    if (visibleCanvas) {
      downloadCanvasAsPNG(visibleCanvas);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const srcCanvas = hiddenCanvasRef.current;
    if (navigator.share) {
      try {
        if (srcCanvas) {
          const blob = await new Promise<Blob | null>((resolve) =>
            srcCanvas.toBlob(resolve, "image/png")
          );
          if (blob) {
            const file = new File([blob], "ARRC-QR-Code.png", {
              type: "image/png",
            });
            await navigator.share({
              title: "ARRC – African Royal Rainbow Congress",
              text: "Join the African Royal Rainbow Congress. Together we build a South Africa that works for all.",
              url: SITE_URL,
              files: [file],
            });
            return;
          }
        }
        // Fallback to URL share
        await navigator.share({
          title: "ARRC – African Royal Rainbow Congress",
          text: "Join the African Royal Rainbow Congress. Together we build a South Africa that works for all.",
          url: SITE_URL,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      // Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(SITE_URL);
        alert("Link copied to clipboard: " + SITE_URL);
      } catch {
        window.open(SITE_URL, "_blank");
      }
    }
  }, []);

  return (
    <>
      {/* Floating QR Button — BOTTOM LEFT to avoid chatbot on right */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-arrc-950 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 border-2 border-arrc-gold/40 hover:border-arrc-gold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Show QR Code"
      >
        <QrCode className="h-6 w-6" />
      </motion.button>

      {/* Hidden high-res canvas for downloads (always rendered but invisible) */}
      <div
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none"
        aria-hidden="true"
      >
        <QRCodeCanvas
          ref={hiddenCanvasRef}
          value={SITE_URL}
          size={512}
          level="H"
          bgColor="#ffffff"
          fgColor="#0f2b46"
        />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                {/* Header */}
                <div className="relative bg-arrc-950 px-6 py-5">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <h3 className="text-xl font-bold text-arrc-gold">
                    Scan to Visit ARRC
                  </h3>
                  <p className="text-sm text-arrc-300 mt-1">
                    Share the ARRC website with your community
                  </p>
                </div>

                {/* QR Code */}
                <div className="p-8 flex flex-col items-center">
                  <div
                    id="arrc-qr-visible"
                    className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-inner"
                  >
                    <QRCodeCanvas
                      value={SITE_URL}
                      size={220}
                      level="H"
                      bgColor="#ffffff"
                      fgColor="#0f2b46"
                    />
                  </div>

                  <p className="mt-4 text-sm text-gray-500 text-center">
                    Point your phone camera at the QR code
                    <br />
                    to open the ARRC website
                  </p>

                  <div className="mt-2 px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-mono text-arrc-950 font-semibold">
                      {SITE_URL}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 border-arrc-950 text-arrc-950 hover:bg-arrc-950 hover:text-white cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-arrc-950 hover:bg-arrc-800 text-white cursor-pointer"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
