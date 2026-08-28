"use client";

import { useState, useRef, useCallback } from "react";
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
  IdCard,
  Sparkles,
  RefreshCw,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Provinces & Regions ─── */
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

const regionsByProvince: Record<string, string[]> = {
  "Eastern Cape": ["Buffalo City", "Nelson Mandela Bay", "Chris Hani", "OR Tambo", "Alfred Nzo", "Joe Gqabi", "Sarah Baartman", "Amathole"],
  "Free State": ["Mangaung", "Fezile Dabi", "Thabo Mofutsanyane", "Xhariep", "Lejweleputswa"],
  "Gauteng": ["City of Johannesburg", "City of Tshwane", "Ekurhuleni", "Sedibeng", "West Rand"],
  "KwaZulu-Natal": ["eThekwini", "uMgungundlovu", "uThukela", "uMzinyathi", "Amajuba", "Zululand", "uMkhanyakude", "King Cetshwayo", "iLembe", "Harry Gwala"],
  "Limpopo": ["Capricorn", "Mopani", "Sekhukhune", "Vhembe", "Waterberg"],
  "Mpumalanga": ["Gert Sibande", "Nkangala", "Ehlanzeni"],
  "Northern Cape": ["Frances Baard", "John Taolo Gaetsewe", "Pixley Ka Seme", "ZF Mgcawu", "Namakwa"],
  "North West": ["Bojanala", "Ngaka Modiri Molema", "Dr Kenneth Kaunda", "Dr Ruth Segomotsi Mompati"],
  "Western Cape": ["City of Cape Town", "Cape Winelands", "Garden Route", "Overberg", "West Coast", "Central Karoo"],
};

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

/* ─── Card Generator ─── */
async function generateCardImage(params: {
  firstName: string;
  lastName: string;
  memberId: string;
  gender: string;
  dateOfBirth: string;
  province: string;
  region: string;
  ward: string;
  status: string;
  selfieDataUrl: string | null;
}): Promise<Blob> {
  const {
    firstName, lastName, memberId, gender, dateOfBirth,
    province, region, ward, status, selfieDataUrl,
  } = params;

  const W = 1050;
  const H = 700;
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

  // ─── Member details (right of selfie) ───
  const detailsX = 195;
  let detailsY = 120;

  // Row 1: Member Name
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillText("MEMBER NAME", detailsX, detailsY);
  detailsY += 18;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(`${firstName} ${lastName}`, detailsX, detailsY);
  detailsY += 32;

  // Row 2: Member ID + Gender
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillText("MEMBER ID", detailsX, detailsY);
  ctx.fillText("GENDER", detailsX + 300, detailsY);
  detailsY += 16;

  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillText(memberId || "PENDING", detailsX, detailsY);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillText(gender || "—", detailsX + 300, detailsY);
  detailsY += 28;

  // Row 3: Date of Birth + Status
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillText("DATE OF BIRTH", detailsX, detailsY);
  ctx.fillText("STATUS", detailsX + 300, detailsY);
  detailsY += 16;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillText(dateOfBirth || "—", detailsX, detailsY);

  const statusClr = status === "active" ? "#22c55e" : status === "pending" ? "#eab308" : "#ef4444";
  ctx.fillStyle = statusClr;
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  ctx.fillText(status.toUpperCase(), detailsX + 300, detailsY);
  detailsY += 28;

  // Row 4: Province + Region
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillText("PROVINCE", detailsX, detailsY);
  ctx.fillText("REGION", detailsX + 300, detailsY);
  detailsY += 16;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
  ctx.fillText(province || "—", detailsX, detailsY);
  ctx.fillText(region || "—", detailsX + 300, detailsY);
  detailsY += 28;

  // Row 5: Ward
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillText("WARD / BRANCH", detailsX, detailsY);
  detailsY += 16;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
  ctx.fillText(ward || "—", detailsX, detailsY);

  // ─── Bottom separator ───
  const bottomLineY = 440;
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

  // ─── Bottom details ───
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

/* ─── Helper ─── */
function triggerDownload(url: string, id?: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `ARRC-Card-${id || "member"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ─── Main Component ─── */
export function CRMCardMaker() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [ward, setWard] = useState("");
  const [status, setStatus] = useState("active");
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = firstName.trim() && lastName.trim();

  // Derive available regions from selected province
  const availableRegions = province ? (regionsByProvince[province] || []) : [];

  const handleProvinceChange = (v: string) => {
    setProvince(v);
    setRegion(""); // reset region when province changes
    setCardPreviewUrl(null);
  };

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
        const cCtx = cvs.getContext("2d")!;
        cCtx.drawImage(img, 0, 0, cvs.width, cvs.height);
        const dataUrl = cvs.toDataURL("image/jpeg", 0.85);
        setSelfieDataUrl(dataUrl);
        setSelfiePreview(dataUrl);
        setCardPreviewUrl(null);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const cardParams = {
    firstName, lastName, memberId, gender, dateOfBirth,
    province, region, ward, status, selfieDataUrl,
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const blob = await generateCardImage(cardParams);
      const url = URL.createObjectURL(blob);
      if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
      setCardPreviewUrl(url);
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }, [canGenerate, cardParams, cardPreviewUrl]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await generateCardImage(cardParams);
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
  }, [cardParams, memberId, firstName]);

  const handleShare = useCallback(async () => {
    try {
      const blob = await generateCardImage(cardParams);
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
  }, [cardParams, memberId, firstName, lastName]);

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setMemberId("");
    setGender("");
    setDateOfBirth("");
    setProvince("");
    setRegion("");
    setWard("");
    setStatus("active");
    setSelfieDataUrl(null);
    setSelfiePreview(null);
    if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
    setCardPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arrc-gold/10">
          <IdCard className="h-5 w-5 text-arrc-gold" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-arrc-950">Card Maker</h2>
          <p className="text-xs text-gray-500">Generate membership cards for members</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Left: Form ─── */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm">First Name <span className="text-red-500">*</span></Label>
              <Input
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setCardPreviewUrl(null); }}
                placeholder="e.g. Thabo"
                className="border-gray-200 focus:border-arrc-gold h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Last Name <span className="text-red-500">*</span></Label>
              <Input
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setCardPreviewUrl(null); }}
                placeholder="e.g. Mbeki"
                className="border-gray-200 focus:border-arrc-gold h-10"
              />
            </div>
          </div>

          {/* Member ID */}
          <div className="space-y-1.5">
            <Label className="text-sm">Member ID</Label>
            <Input
              value={memberId}
              onChange={(e) => { setMemberId(e.target.value.toUpperCase()); setCardPreviewUrl(null); }}
              placeholder="e.g. ARRC-A1B2C3"
              className="border-gray-200 focus:border-arrc-gold h-10 font-mono"
            />
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Gender</Label>
              <Select value={gender} onValueChange={(v) => { setGender(v); setCardPreviewUrl(null); }}>
                <SelectTrigger className="border-gray-200 focus:border-arrc-gold h-10">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Date of Birth</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => { setDateOfBirth(e.target.value); setCardPreviewUrl(null); }}
                className="border-gray-200 focus:border-arrc-gold h-10"
              />
            </div>
          </div>

          {/* Province & Region */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Province</Label>
              <Select value={province} onValueChange={handleProvinceChange}>
                <SelectTrigger className="border-gray-200 focus:border-arrc-gold h-10">
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
              <Label className="text-sm">Region</Label>
              <Select value={region} onValueChange={(v) => { setRegion(v); setCardPreviewUrl(null); }} disabled={!province}>
                <SelectTrigger className="border-gray-200 focus:border-arrc-gold h-10">
                  <SelectValue placeholder={province ? "Select region" : "Select province first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRegions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ward & Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Ward / Branch</Label>
              <Input
                value={ward}
                onChange={(e) => { setWard(e.target.value); setCardPreviewUrl(null); }}
                placeholder="e.g. Ward 92"
                className="border-gray-200 focus:border-arrc-gold h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Status</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setCardPreviewUrl(null); }}>
                <SelectTrigger className="border-gray-200 focus:border-arrc-gold h-10">
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
            <Label className="text-sm">Photo (optional)</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-arrc-gold/30 bg-gray-50 shrink-0">
                {selfiePreview ? (
                  <img src={selfiePreview} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-300" />
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
                  className="w-full border-arrc-gold/30 text-arrc-gold hover:bg-arrc-gold/5"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {selfiePreview ? "Change Photo" : "Upload Photo"}
                </Button>
                {selfiePreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelfieDataUrl(null); setSelfiePreview(null); setCardPreviewUrl(null); }}
                    className="w-full text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold h-11"
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
              className="border-gray-200 text-gray-500 hover:bg-gray-50 h-11"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </div>

        {/* ─── Right: Preview ─── */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arrc-100">
              <IdCard className="h-5 w-5 text-arrc-800" />
            </div>
            <div>
              <h3 className="font-bold text-arrc-950">Card Preview</h3>
              <p className="text-xs text-gray-400">Generate to see the card</p>
            </div>
          </div>

          {cardPreviewUrl ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden border border-arrc-gold/20 shadow-lg flex-1 flex items-center">
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
                  className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold"
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
                  className="border-arrc-gold/30 text-arrc-gold hover:bg-arrc-gold/5"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-arrc-gold/10">
                <IdCard className="h-7 w-7 text-arrc-gold" />
              </div>
              {canGenerate ? (
                <>
                  <p className="text-gray-500 text-sm mb-1">Ready to generate</p>
                  <p className="text-gray-400 text-xs">Click &quot;Generate&quot; to create the card</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-1">Enter member details</p>
                  <p className="text-gray-400 text-xs">First name and last name are required</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
