"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  User,
  Camera,
  Share2,
  IdCard,
  Sparkles,
  RefreshCw,
  Smartphone,
  CreditCard,
} from "lucide-react";

/* ─── Provinces ─── */
const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

/* ─── Canvas helpers ─── */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ─── Card Generator ─── */
async function generateCardImage(
  firstName: string,
  lastName: string,
  memberId: string,
  province: string,
  status: string,
  selfieDataUrl: string | null
): Promise<Blob> {
  const W = 1050;
  const H = 600;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0a1628");
  bgGrad.addColorStop(0.5, "#0f2b46");
  bgGrad.addColorStop(1, "#0a1628");
  drawRoundedRect(ctx, 0, 0, W, H, 24);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Gold border
  drawRoundedRect(ctx, 2, 2, W - 4, H - 4, 22);
  ctx.strokeStyle = "#d4a843";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner border
  drawRoundedRect(ctx, 8, 8, W - 16, H - 16, 18);
  ctx.strokeStyle = "rgba(212, 168, 67, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Decorative circles
  ctx.beginPath();
  ctx.arc(W - 60, 60, 120, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.04)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(80, H - 40, 100, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.04)";
  ctx.fill();

  // Gold accent line
  const lineGrad = ctx.createLinearGradient(40, 0, W - 40, 0);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.2, "#d4a843");
  lineGrad.addColorStop(0.8, "#d4a843");
  lineGrad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.moveTo(40, 75);
  ctx.lineTo(W - 40, 75);
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Logo
  let logoLoaded = false;
  try {
    const logoImg = await loadImage("/logo.jpg");
    ctx.save();
    ctx.beginPath();
    ctx.arc(60, 45, 24, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, 36, 21, 48, 48);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(60, 45, 26, 0, Math.PI * 2);
    ctx.strokeStyle = "#d4a843";
    ctx.lineWidth = 2;
    ctx.stroke();
    logoLoaded = true;
  } catch {
    logoLoaded = false;
  }

  // Header text
  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillText("AFRICAN ROYAL RAINBOW CONGRESS", logoLoaded ? 96 : 40, 38);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  ctx.fillText("OFFICIAL MEMBERSHIP CARD", logoLoaded ? 96 : 40, 56);

  // Year
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("2025–2026", W - 40, 42);
  ctx.textAlign = "left";

  // Selfie area
  const selfieSize = 120;
  const selfieX = 50;
  const selfieY = 110;

  if (selfieDataUrl) {
    try {
      const selfieImg = await loadImage(selfieDataUrl);
      ctx.save();
      drawRoundedRect(ctx, selfieX, selfieY, selfieSize, selfieSize, 12);
      ctx.clip();
      const srcSize = Math.min(selfieImg.width, selfieImg.height);
      const sx = (selfieImg.width - srcSize) / 2;
      const sy = (selfieImg.height - srcSize) / 2;
      ctx.drawImage(selfieImg, sx, sy, srcSize, srcSize, selfieX, selfieY, selfieSize, selfieSize);
      ctx.restore();
    } catch {
      drawPlaceholderSelfie(ctx, selfieX, selfieY, selfieSize);
    }
  } else {
    drawPlaceholderSelfie(ctx, selfieX, selfieY, selfieSize);
  }

  // Gold border around selfie
  drawRoundedRect(ctx, selfieX - 2, selfieY - 2, selfieSize + 4, selfieSize + 4, 14);
  ctx.strokeStyle = "#d4a843";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Member details
  const detailsX = 195;
  let detailsY = 125;

  // Member name
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("MEMBER NAME", detailsX, detailsY);
  detailsY += 24;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(`${firstName} ${lastName}`, detailsX, detailsY);
  detailsY += 40;

  // Member ID
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("MEMBER ID", detailsX, detailsY);
  detailsY += 22;

  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillText(memberId || "PENDING", detailsX, detailsY);
  detailsY += 36;

  // Province & Status
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("PROVINCE", detailsX, detailsY);
  ctx.fillText("STATUS", detailsX + 280, detailsY);
  detailsY += 20;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillText(province, detailsX, detailsY);

  const statusColor = status === "active" ? "#22c55e" : status === "pending" ? "#eab308" : "#ef4444";
  ctx.fillStyle = statusColor;
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  ctx.fillText(status.toUpperCase(), detailsX + 280, detailsY);

  // Bottom separator
  const bottomLineY = 370;
  const bottomLineGrad = ctx.createLinearGradient(40, 0, W - 40, 0);
  bottomLineGrad.addColorStop(0, "transparent");
  bottomLineGrad.addColorStop(0.15, "rgba(212, 168, 67, 0.4)");
  bottomLineGrad.addColorStop(0.85, "rgba(212, 168, 67, 0.4)");
  bottomLineGrad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.moveTo(40, bottomLineY);
  ctx.lineTo(W - 40, bottomLineY);
  ctx.strokeStyle = bottomLineGrad;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Bottom details
  const bottomY = bottomLineY + 30;

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Capitec Bank  •  Acc: 2544478930", 50, bottomY);
  ctx.fillText("www.arrc.co.za", 50, bottomY + 22);

  // R20/YEAR
  ctx.textAlign = "right";
  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.fillText("R20/YEAR", W - 50, bottomY + 5);

  // Payment status
  const payColor = status === "active" ? "#22c55e" : "#eab308";
  ctx.fillStyle = payColor;
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    status === "active" ? "✓ PAYMENT CONFIRMED" : "⏳ PAYMENT PENDING",
    W - 50,
    bottomY + 28
  );
  ctx.textAlign = "left";

  // QR placeholder
  const qrSize = 90;
  const qrX = W - qrSize - 45;
  const qrY = bottomLineY + 10;
  drawQRPlaceholder(ctx, qrX, qrY, qrSize, memberId);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate card image"));
      },
      "image/png",
      1.0
    );
  });
}

function drawPlaceholderSelfie(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawRoundedRect(ctx, x, y, size, size, 12);
  ctx.fillStyle = "rgba(212, 168, 67, 0.1)";
  ctx.fill();

  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.beginPath();
  ctx.arc(cx, cy - 12, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.3)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx, cy + 30, 28, 22, 0, Math.PI, 0);
  ctx.fillStyle = "rgba(212, 168, 67, 0.3)";
  ctx.fill();
}

function drawQRPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, memberId: string) {
  const cellSize = size / 15;
  ctx.fillStyle = "rgba(212, 168, 67, 0.15)";
  drawRoundedRect(ctx, x - 4, y - 4, size + 8, size + 8, 8);
  ctx.fill();

  const seed = memberId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i: number) => ((seed * (i + 1) * 2654435761) >>> 0) % 100;

  const cornerSize = 3;
  drawQRCorner(ctx, x, y, cellSize, cornerSize);
  drawQRCorner(ctx, x + (15 - cornerSize) * cellSize, y, cellSize, cornerSize);
  drawQRCorner(ctx, x, y + (15 - cornerSize) * cellSize, cellSize, cornerSize);

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if ((row < cornerSize + 1 && col < cornerSize + 1) ||
          (row < cornerSize + 1 && col >= 15 - cornerSize - 1) ||
          (row >= 15 - cornerSize - 1 && col < cornerSize + 1)) continue;
      if (rng(row * 15 + col) > 50) {
        ctx.fillStyle = "rgba(212, 168, 67, 0.6)";
        ctx.fillRect(x + col * cellSize + 0.5, y + row * cellSize + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }
}

function drawQRCorner(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, size: number) {
  ctx.fillStyle = "rgba(212, 168, 67, 0.6)";
  ctx.fillRect(x, y, size * cellSize, size * cellSize);
  ctx.fillStyle = "rgba(10, 22, 40, 0.8)";
  ctx.fillRect(x + cellSize, y + cellSize, (size - 2) * cellSize, (size - 2) * cellSize);
  ctx.fillStyle = "rgba(212, 168, 67, 0.6)";
  ctx.fillRect(x + cellSize * 1.5, y + cellSize * 1.5, (size - 3) * cellSize, (size - 3) * cellSize);
}

/* ─── Main Component ─── */
export function MembershipCardMaker() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState("active");
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = firstName.trim() && lastName.trim();

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement("canvas");
        const maxSize = 300;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        cvs.width = img.width * ratio;
        cvs.height = img.height * ratio;
        const ctx = cvs.getContext("2d")!;
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        const dataUrl = cvs.toDataURL("image/jpeg", 0.85);
        setSelfieDataUrl(dataUrl);
        setSelfiePreview(dataUrl);
        setCardPreviewUrl(null);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const blob = await generateCardImage(firstName, lastName, memberId, province, status, selfieDataUrl);
      const url = URL.createObjectURL(blob);
      if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
      setCardPreviewUrl(url);
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }, [firstName, lastName, memberId, province, status, selfieDataUrl, cardPreviewUrl, canGenerate]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await generateCardImage(firstName, lastName, memberId, province, status, selfieDataUrl);
      const url = URL.createObjectURL(blob);

      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
          const file = new File([blob], `ARRC-Card-${memberId || firstName}.png`, { type: "image/png" });
          await navigator.share({ files: [file], title: "ARRC Membership Card" });
        } catch (shareErr) {
          if ((shareErr as Error).name !== "AbortError") {
            triggerDownload(url, memberId || firstName);
          }
        }
      } else {
        triggerDownload(url, memberId || firstName);
      }
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  }, [firstName, lastName, memberId, province, status, selfieDataUrl]);

  const handleShare = useCallback(async () => {
    try {
      const blob = await generateCardImage(firstName, lastName, memberId, province, status, selfieDataUrl);
      const file = new File([blob], `ARRC-Card-${memberId || firstName}.png`, { type: "image/png" });
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "ARRC Membership Card",
          text: `${firstName} ${lastName} - ${memberId}`,
        });
      } else {
        await navigator.clipboard.writeText(`ARRC Membership Card\n${firstName} ${lastName}\n${memberId}`);
      }
    } catch {
      // cancelled
    }
  }, [firstName, lastName, memberId, province, status, selfieDataUrl]);

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setMemberId("");
    setProvince("");
    setStatus("active");
    setSelfieDataUrl(null);
    setSelfiePreview(null);
    if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
    setCardPreviewUrl(null);
  };

  return (
    <section id="card" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-arrc-950 via-arrc-900 to-arrc-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-arrc-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-arrc-700/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4"
          >
            <IdCard className="h-4 w-4 text-arrc-gold" />
            <span className="text-sm font-semibold text-arrc-gold">Admin Tool</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white sm:text-5xl tracking-tight">
            Membership Card{" "}
            <span className="text-arrc-gold">Creator</span>
          </h2>
          <div className="mt-4 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-5 text-white/60 max-w-2xl mx-auto text-lg">
            Enter member details below to generate and download an official ARRC membership card.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ─── Left: Form ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arrc-gold/10">
                  <CreditCard className="h-5 w-5 text-arrc-gold" />
                </div>
                <h3 className="text-lg font-bold text-white">Member Details</h3>
              </div>

              {/* Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">First Name <span className="text-red-400">*</span></Label>
                  <Input
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setCardPreviewUrl(null); }}
                    placeholder="e.g. Thabo"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Last Name <span className="text-red-400">*</span></Label>
                  <Input
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setCardPreviewUrl(null); }}
                    placeholder="e.g. Mbeki"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold h-11"
                  />
                </div>
              </div>

              {/* Member ID */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Member ID</Label>
                <Input
                  value={memberId}
                  onChange={(e) => { setMemberId(e.target.value.toUpperCase()); setCardPreviewUrl(null); }}
                  placeholder="e.g. ARRC-A1B2C3"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold h-11 font-mono"
                />
              </div>

              {/* Province & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Province</Label>
                  <Select value={province} onValueChange={(v) => { setProvince(v); setCardPreviewUrl(null); }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-arrc-gold h-11">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Status</Label>
                  <Select value={status} onValueChange={(v) => { setStatus(v); setCardPreviewUrl(null); }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-arrc-gold h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Photo (optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-arrc-gold/30 bg-white/5 shrink-0">
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleSelfieUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-arrc-gold/30 text-arrc-gold hover:bg-arrc-gold/10 bg-transparent"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {selfiePreview ? "Change" : "Upload Photo"}
                    </Button>
                    {selfiePreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelfieDataUrl(null); setSelfiePreview(null); setCardPreviewUrl(null); }}
                        className="w-full text-white/40 hover:text-white hover:bg-white/5 text-xs"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                className="bg-gradient-to-r from-arrc-gold to-arrc-gold/90 text-arrc-950 hover:from-arrc-gold/90 hover:to-arrc-gold/80 font-bold h-12 shadow-lg shadow-arrc-gold/20"
              >
                {generating ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block h-4 w-4 border-2 border-arrc-950/30 border-t-arrc-950 rounded-full"
                  />
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white bg-transparent h-12"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </motion.div>

          {/* ─── Right: Preview ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arrc-gold/10">
                  <IdCard className="h-5 w-5 text-arrc-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Card Preview</h3>
                  <p className="text-xs text-white/40">Generate to see the card</p>
                </div>
              </div>

              {cardPreviewUrl ? (
                <div className="flex-1 flex flex-col gap-4">
                  <div className="rounded-xl overflow-hidden border border-arrc-gold/20 shadow-2xl shadow-arrc-gold/10 flex-1 flex items-center">
                    <img
                      src={cardPreviewUrl}
                      alt="ARRC Membership Card"
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="bg-gradient-to-r from-arrc-gold to-arrc-gold/90 text-arrc-950 hover:from-arrc-gold/90 hover:to-arrc-gold/80 font-bold shadow-lg shadow-arrc-gold/20"
                    >
                      {downloading ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block h-4 w-4 border-2 border-arrc-950/30 border-t-arrc-950 rounded-full"
                        />
                      ) : (
                        <><Download className="h-4 w-4 mr-2" /> Download</>
                      )}
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="border-arrc-gold/30 text-arrc-gold hover:bg-arrc-gold/10 bg-transparent"
                    >
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                    <Smartphone className="h-3.5 w-3.5" />
                    Long-press image to save on mobile
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-arrc-gold/10">
                    <IdCard className="h-8 w-8 text-arrc-gold" />
                  </div>
                  {canGenerate ? (
                    <>
                      <p className="text-white/50 text-sm mb-1">Ready to generate</p>
                      <p className="text-white/30 text-xs">Click &quot;Generate&quot; to create the card</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/50 text-sm mb-1">Enter member details</p>
                      <p className="text-white/30 text-xs">First name and last name are required</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Helper ─── */
function triggerDownload(url: string, id?: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `ARRC-Card-${id || "member"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
