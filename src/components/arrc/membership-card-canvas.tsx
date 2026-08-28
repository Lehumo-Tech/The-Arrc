"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Download, Printer, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberCardData {
  firstName: string;
  lastName: string;
  memberId: string;
  gender: string;
  dateOfBirth: string;
  idNumber: string;
  province: string;
  wardBranch: string;
  occupation: string;
  email: string;
  phone: string;
  address: string;
  cardNumber: string;
  cardType: string;
  issueDate: string;
  expiryDate: string;
  selfieUrl?: string | null;
  status?: string;
}

/* ─── Card dimensions (landscape ID-card ratio, 2x for retina) ─── */
const CARD_W = 1050;
const CARD_H = 660;
const SCALE = 2;

/* ─── Helper: load an image with CORS ─── */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ─── Helper: rounded rect ─── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

/* ─── Helper: draw text with letter spacing ─── */
function drawSpacedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cx, y);
    cx += ctx.measureText(text[i]).width + spacing;
  }
}

/* ─── Helper: gradient divider ─── */
function drawDivider(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
  const grad = ctx.createLinearGradient(x1, 0, x2, 0);
  grad.addColorStop(0, "rgba(212, 168, 67, 0)");
  grad.addColorStop(0.5, "rgba(212, 168, 67, 0.4)");
  grad.addColorStop(1, "rgba(212, 168, 67, 0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

/* ─── Helper: draw placeholder silhouette ─── */
function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = "rgba(212, 168, 67, 0.08)";
  ctx.fill();
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.12, w * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.25)";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.22, w * 0.24, h * 0.18, 0, Math.PI, 0);
  ctx.fillStyle = "rgba(212, 168, 67, 0.25)";
  ctx.fill();
}

/* ─── Helper: simple QR-like pattern placeholder ─── */
function drawQRPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, seed: string) {
  const cells = 15;
  const cell = size / cells;
  // Deterministic pseudo-random from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  ctx.fillStyle = "#ffffff";
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      if ((hash / 0x7fffffff) > 0.5) {
        ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
      }
    }
  }
  // Corner squares (position markers)
  const corner = 3 * cell;
  ctx.fillStyle = "#ffffff";
  [[0, 0], [cells - 3, 0], [0, cells - 3]].forEach(([cc, cr]) => {
    ctx.fillRect(x + cc * cell, y + cr * cell, corner, corner);
  });
  ctx.fillStyle = "#0a1628";
  [[1, 1], [cells - 2, 1], [1, cells - 2]].forEach(([cc, cr]) => {
    ctx.fillRect(x + cc * cell, y + cr * cell, cell, cell);
  });
}

/* ═══════════════════════════════════════════════════════════════
    DRAW CARD FRONT
    Logo • Member Photo • Name • Member ID • Dates • Status
═══════════════════════════════════════════════════════════════ */
async function drawCardFront(canvas: HTMLCanvasElement, member: MemberCardData) {
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // Background
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#0a1628");
  bg.addColorStop(0.5, "#0f2b46");
  bg.addColorStop(1, "#0a1628");
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 24);
  ctx.fillStyle = bg;
  ctx.fill();

  // Gold borders
  roundRect(ctx, 2, 2, CARD_W - 4, CARD_H - 4, 22);
  ctx.strokeStyle = "rgba(212, 168, 67, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, 8, 8, CARD_W - 16, CARD_H - 16, 18);
  ctx.strokeStyle = "rgba(212, 168, 67, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Decorative circles
  ctx.beginPath();
  ctx.arc(CARD_W - 60, 60, 120, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.04)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, CARD_H - 40, 100, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.04)";
  ctx.fill();

  // Gold accent line under header
  drawDivider(ctx, 40, 78, CARD_W - 40);

  // ─── ARRC LOGO (actual image) ───
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
    // Fallback: letter A
    ctx.fillStyle = "rgba(212, 168, 67, 0.15)";
    ctx.beginPath();
    ctx.arc(60, 45, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 168, 67, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(60, 45, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#d4a843";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A", 60, 46);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  // Header text
  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 16px system-ui, sans-serif";
  ctx.fillText("AFRICAN ROYAL RAINBOW CONGRESS", logoLoaded ? 96 : 40, 36);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillText("OFFICIAL MEMBERSHIP CARD", logoLoaded ? 96 : 40, 56);

  // Year range (top right)
  const issueYear = member.issueDate ? new Date(member.issueDate).getFullYear() : new Date().getFullYear();
  const expiryYear = member.expiryDate && member.expiryDate !== "—" ? new Date(member.expiryDate).getFullYear() : issueYear + 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${issueYear}–${expiryYear}`, CARD_W - 40, 42);

  // Card type badge (top right, below year)
  const cardTypeLabel = (member.cardType || "standard").toUpperCase();
  const badgeX = CARD_W - 40;
  ctx.fillStyle = cardTypeLabel === "PREMIUM" ? "rgba(212, 168, 67, 0.2)" : "rgba(255, 255, 255, 0.08)";
  roundRect(ctx, badgeX - 72, 58, 72, 16, 4);
  ctx.fill();
  ctx.fillStyle = cardTypeLabel === "PREMIUM" ? "#d4a843" : "rgba(255, 255, 255, 0.5)";
  ctx.font = "bold 9px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(cardTypeLabel, badgeX - 36, 63);
  ctx.textAlign = "left";

  // ─── MEMBER PHOTO (actual image from selfieUrl) ───
  const photoX = 50;
  const photoY = 108;
  const photoSize = 140;

  ctx.save();
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 12);
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fill();
  ctx.restore();

  let photoLoaded = false;
  if (member.selfieUrl) {
    try {
      const photoImg = await loadImage(member.selfieUrl);
      ctx.save();
      roundRect(ctx, photoX, photoY, photoSize, photoSize, 12);
      ctx.clip();
      const srcSize = Math.min(photoImg.width, photoImg.height);
      const sx = (photoImg.width - srcSize) / 2;
      const sy = (photoImg.height - srcSize) / 2;
      ctx.drawImage(photoImg, sx, sy, srcSize, srcSize, photoX, photoY, photoSize, photoSize);
      ctx.restore();
      photoLoaded = true;
    } catch {
      // fall through to placeholder
    }
  }
  if (!photoLoaded) {
    drawPlaceholder(ctx, photoX, photoY, photoSize, photoSize);
  }

  // Gold border around photo
  roundRect(ctx, photoX - 2, photoY - 2, photoSize + 4, photoSize + 4, 14);
  ctx.strokeStyle = "#d4a843";
  ctx.lineWidth = 2;
  ctx.stroke();

  // ─── Member details (right of photo) ───
  const detailX = 220;
  let dy = 118;

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, sans-serif";
  drawSpacedText(ctx, "MEMBER NAME", detailX, dy, 2);
  dy += 24;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillText(`${member.firstName} ${member.lastName}`.toUpperCase(), detailX, dy);
  dy += 40;

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, sans-serif";
  drawSpacedText(ctx, "MEMBER ID", detailX, dy, 2);
  dy += 22;
  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText(member.memberId || "PENDING", detailX, dy);
  dy += 32;

  // Province & status row
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, sans-serif";
  drawSpacedText(ctx, "PROVINCE", detailX, dy, 2);
  drawSpacedText(ctx, "STATUS", detailX + 300, dy, 2);
  dy += 20;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(member.province || "—", detailX, dy);
  const status = (member.status || "active").toLowerCase();
  const statusColor = status === "active" ? "#22c55e" : status === "pending" ? "#eab308" : "#ef4444";
  ctx.fillStyle = statusColor;
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillText(status.toUpperCase(), detailX + 300, dy);

  // ─── Divider before bottom section ───
  drawDivider(ctx, 40, 300, CARD_W - 40);

  // ─── Dates section ───
  const datesY = 320;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px system-ui, sans-serif";
  drawSpacedText(ctx, "ISSUE DATE", 50, datesY, 2);
  drawSpacedText(ctx, "EXPIRY DATE", 280, datesY, 2);
  drawSpacedText(ctx, "CARD NUMBER", 520, datesY, 2);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(member.issueDate || new Date().toLocaleDateString(), 50, datesY + 20);
  ctx.fillText(member.expiryDate || "—", 280, datesY + 20);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillText(member.cardNumber || "—", 520, datesY + 20);

  // ─── Validity notice ───
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.fillText("Valid for 1 year from issue date. Must be renewed annually.", 50, datesY + 50);

  // ─── Bottom section ───
  drawDivider(ctx, 40, CARD_H - 110, CARD_W - 40);

  // Bank info (bottom left)
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.fillText("Capitec Bank  •  Acc: 2544478930", 50, CARD_H - 80);
  ctx.fillText("www.arrc.co.za", 50, CARD_H - 62);

  // R20/YEAR (bottom center)
  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("R20/YEAR", CARD_W / 2, CARD_H - 68);
  ctx.textAlign = "left";

  // QR code (bottom right)
  const qrSize = 70;
  const qrX = CARD_W - qrSize - 40;
  const qrY = CARD_H - qrSize - 30;
  roundRect(ctx, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  drawQRPattern(ctx, qrX, qrY, qrSize, member.memberId || "ARRC");

  // Authorized signature (bottom right, left of QR)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CARD_W - 260, CARD_H - 50);
  ctx.lineTo(CARD_W - 130, CARD_H - 50);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.font = "9px system-ui, sans-serif";
  ctx.fillText("Authorized Signature", CARD_W - 260, CARD_H - 38);

  // Bottom gold bar
  ctx.fillStyle = "rgba(212, 168, 67, 0.08)";
  ctx.fillRect(20, CARD_H - 12, CARD_W - 40, 4);
  const barGrad = ctx.createLinearGradient(20, 0, CARD_W - 20, 0);
  barGrad.addColorStop(0, "rgba(212, 168, 67, 0.6)");
  barGrad.addColorStop(0.5, "rgba(212, 168, 67, 0.3)");
  barGrad.addColorStop(1, "rgba(212, 168, 67, 0.6)");
  ctx.fillStyle = barGrad;
  ctx.fillRect(20, CARD_H - 12, CARD_W - 40, 2);
}

/* ═══════════════════════════════════════════════════════════════
    DRAW CARD BACK
    Member details grid • Terms • Bank info • QR
═══════════════════════════════════════════════════════════════ */
async function drawCardBack(canvas: HTMLCanvasElement, member: MemberCardData) {
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // Background
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#0a1628");
  bg.addColorStop(0.5, "#0f2b46");
  bg.addColorStop(1, "#0a1628");
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 24);
  ctx.fillStyle = bg;
  ctx.fill();

  // Borders
  roundRect(ctx, 2, 2, CARD_W - 4, CARD_H - 4, 22);
  ctx.strokeStyle = "rgba(212, 168, 67, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, 8, 8, CARD_W - 16, CARD_H - 16, 18);
  ctx.strokeStyle = "rgba(212, 168, 67, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Decorative circles
  ctx.beginPath();
  ctx.arc(60, 60, 120, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.04)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CARD_W - 80, CARD_H - 40, 100, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 168, 67, 0.04)";
  ctx.fill();

  // ─── Header with small logo ───
  let logoLoaded = false;
  try {
    const logoImg = await loadImage("/logo.jpg");
    ctx.save();
    ctx.beginPath();
    ctx.arc(55, 42, 20, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, 35, 22, 40, 40);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(55, 42, 22, 0, Math.PI * 2);
    ctx.strokeStyle = "#d4a843";
    ctx.lineWidth = 2;
    ctx.stroke();
    logoLoaded = true;
  } catch {
    /* fallback below */
  }

  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText("AFRICAN ROYAL RAINBOW CONGRESS", logoLoaded ? 88 : 40, 34);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillText("MEMBER DETAILS", logoLoaded ? 88 : 40, 54);

  // "BACK" label (top right)
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.font = "bold 10px system-ui, sans-serif";
  ctx.textAlign = "right";
  drawSpacedText(ctx, "BACK", CARD_W - 40, 42, 2);
  ctx.textAlign = "left";

  drawDivider(ctx, 40, 80, CARD_W - 40);

  // ─── Detail grid (2 columns x 4 rows) ───
  const col1X = 50;
  const col2X = 540;
  const startY = 105;
  const rowH = 52;

  const rows = [
    ["GENDER", formatGender(member.gender), "DATE OF BIRTH", member.dateOfBirth || "—"],
    ["ID NUMBER", member.idNumber || "—", "PROVINCE", member.province || "—"],
    ["WARD / BRANCH", member.wardBranch || "—", "OCCUPATION", member.occupation || "—"],
    ["EMAIL", member.email || "—", "PHONE", member.phone || "—"],
  ];

  for (let i = 0; i < rows.length; i++) {
    const [l1, v1, l2, v2] = rows[i];
    const y = startY + i * rowH;
    // Label 1
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "9px system-ui, sans-serif";
    drawSpacedText(ctx, l1, col1X, y, 2);
    // Value 1
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.fillText(truncate(ctx, v1, 300), col1X, y + 18);
    // Label 2
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "9px system-ui, sans-serif";
    drawSpacedText(ctx, l2, col2X, y, 2);
    // Value 2
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.fillText(truncate(ctx, v2, 300), col2X, y + 18);
  }

  // Address (full width)
  const addrY = startY + rows.length * rowH + 8;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "9px system-ui, sans-serif";
  drawSpacedText(ctx, "ADDRESS", col1X, addrY, 2);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText(truncate(ctx, member.address || "—", 600), col1X, addrY + 18);

  // ─── Divider ───
  drawDivider(ctx, 40, addrY + 45, CARD_W - 40);

  // ─── Terms & conditions ───
  const termsY = addrY + 65;
  ctx.fillStyle = "rgba(212, 168, 67, 0.7)";
  ctx.font = "bold 10px system-ui, sans-serif";
  drawSpacedText(ctx, "TERMS & CONDITIONS", 50, termsY, 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.fillText("• This card remains the property of the African Royal Rainbow Congress (ARRC).", 50, termsY + 20);
  ctx.fillText("• Valid for 1 year from the issue date. Must be renewed annually.", 50, termsY + 36);
  ctx.fillText("• If found, please return to the nearest ARRC branch or contact info@arrc.co.za.", 50, termsY + 52);

  // ─── Bottom section ───
  drawDivider(ctx, 40, CARD_H - 80, CARD_W - 40);

  // Bank details (bottom left)
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.fillText("Banking: Capitec Bank  •  Account: 2544478930  •  Branch: 250655", 50, CARD_H - 55);
  ctx.fillText("Reference: ARRC + Member ID  •  www.arrc.co.za", 50, CARD_H - 38);

  // R20/YEAR (bottom right)
  ctx.fillStyle = "#d4a843";
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("R20/YEAR", CARD_W - 50, CARD_H - 45);
  ctx.textAlign = "left";

  // Bottom gold bar
  ctx.fillStyle = "rgba(212, 168, 67, 0.08)";
  ctx.fillRect(20, CARD_H - 12, CARD_W - 40, 4);
  const barGrad = ctx.createLinearGradient(20, 0, CARD_W - 20, 0);
  barGrad.addColorStop(0, "rgba(212, 168, 67, 0.6)");
  barGrad.addColorStop(0.5, "rgba(212, 168, 67, 0.3)");
  barGrad.addColorStop(1, "rgba(212, 168, 67, 0.6)");
  ctx.fillStyle = barGrad;
  ctx.fillRect(20, CARD_H - 12, CARD_W - 40, 2);
}

/* ─── Truncate text to fit a max width ─── */
function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

/* ─── Format gender ─── */
function formatGender(g: string): string {
  switch (g?.toLowerCase()) {
    case "male": return "Male";
    case "female": return "Female";
    case "non-binary": return "Non-binary";
    case "prefer-not-to-say": return "Prefer not to say";
    default: return g || "—";
  }
}

/* ═══════════════════════════════════════════════════════════════
    REACT COMPONENT
═══════════════════════════════════════════════════════════════ */
export function MembershipCardCanvas({ member }: { member: MemberCardData }) {
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showBack, setShowBack] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (frontCanvasRef.current) {
        await drawCardFront(frontCanvasRef.current, member);
      }
      if (backCanvasRef.current) {
        await drawCardBack(backCanvasRef.current, member);
      }
      if (!cancelled) setRendered(true);
    }
    render();
    return () => { cancelled = true; };
  }, [member]);

  /* Download both sides as a single PNG (front on top, back below) */
  const handleDownload = useCallback(() => {
    if (!rendered || !frontCanvasRef.current || !backCanvasRef.current) return;
    const front = frontCanvasRef.current;
    const back = backCanvasRef.current;
    const combined = document.createElement("canvas");
    combined.width = front.width;
    combined.height = front.height + back.height + 40;
    const ctx = combined.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, combined.width, combined.height);
    ctx.drawImage(front, 0, 0);
    ctx.drawImage(back, 0, front.height + 40);
    const link = document.createElement("a");
    link.download = `ARRC-Card-${member.memberId}.png`;
    link.href = combined.toDataURL("image/png", 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [member.memberId, rendered]);

  /* Print both sides */
  const handlePrint = useCallback(() => {
    if (!rendered || !frontCanvasRef.current || !backCanvasRef.current) return;
    const frontUrl = frontCanvasRef.current.toDataURL("image/png", 1.0);
    const backUrl = backCanvasRef.current.toDataURL("image/png", 1.0);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>ARRC Membership Card - ${member.memberId}</title>
      <style>@page{size:auto;margin:0}body{margin:0;padding:20px;display:flex;flex-direction:column;align-items:center;gap:20px;background:#fff;font-family:sans-serif}
      img{max-width:500px;width:100%;height:auto}.label{color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px}</style>
      </head><body><div class="label">Front</div><img src="${frontUrl}"/><div class="label">Back</div><img src="${backUrl}"/>
      <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    w.document.close();
  }, [member.memberId, rendered]);

  return (
    <div className="space-y-4">
      {/* Hidden canvases for image generation */}
      <canvas ref={frontCanvasRef} className="hidden" />
      <canvas ref={backCanvasRef} className="hidden" />

      {/* Visual preview with flip toggle */}
      <div className="max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl border-2 border-arrc-gold/40 shadow-xl">
          {!showBack ? (
            <div className="relative bg-gradient-to-br from-arrc-950 via-arrc-800 to-arrc-950 text-white">
              {/* Decorative */}
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-arrc-gold/5 -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-arrc-gold/5 translate-y-1/3 -translate-x-1/3" />
              <div className="relative z-10 p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.jpg" alt="ARRC Logo" className="h-10 w-10 rounded-full border-2 border-arrc-gold object-cover" />
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-arrc-gold uppercase">African Royal Rainbow Congress</p>
                      <p className="text-[9px] text-white/50">Official Membership Card</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/40">{member.issueDate ? new Date(member.issueDate).getFullYear() : new Date().getFullYear()}–{member.expiryDate && member.expiryDate !== "—" ? new Date(member.expiryDate).getFullYear() : (member.issueDate ? new Date(member.issueDate).getFullYear() + 1 : new Date().getFullYear() + 1)}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-arrc-gold/10 text-arrc-gold/80 border border-arrc-gold/20">{member.cardType || "standard"}</span>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-arrc-gold/40 to-transparent mb-4" />
                {/* Photo + details */}
                <div className="flex gap-4 mb-4">
                  <div className="shrink-0 w-28 h-28 rounded-lg border-2 border-arrc-gold overflow-hidden bg-white/5">
                    {member.selfieUrl ? (
                      <img src={member.selfieUrl} alt="Member" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-arrc-gold/20 text-3xl">👤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">Member Name</p>
                    <p className="text-lg font-bold tracking-wide truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-[9px] text-white/50 uppercase tracking-widest mt-2 mb-0.5">Member ID</p>
                    <p className="text-sm font-mono font-bold text-arrc-gold">{member.memberId}</p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className="text-[8px] text-white/50 uppercase tracking-widest">Province</p>
                        <p className="text-xs font-medium truncate">{member.province}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/50 uppercase tracking-widest">Status</p>
                        <p className="text-xs font-bold text-green-400">{(member.status || "active").toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent mb-3" />
                {/* Dates */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Issue</p><p className="font-medium text-[11px]">{member.issueDate || new Date().toLocaleDateString()}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Expiry</p><p className="font-medium text-[11px]">{member.expiryDate || "—"}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Card No.</p><p className="font-mono text-[11px] text-white/70">{member.cardNumber || "—"}</p></div>
                </div>
                <p className="text-[8px] text-white/30 mb-3">Valid for 1 year from issue date. Must be renewed annually.</p>
                <div className="h-px bg-white/10 mb-2" />
                {/* Footer */}
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-white/35">Capitec | Acc: 2544478930</span>
                  <span className="text-arrc-gold font-bold text-sm">R20/YEAR</span>
                  <span className="text-white/25">www.arrc.co.za</span>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-arrc-gold/60 via-arrc-gold/30 to-arrc-gold/60" />
            </div>
          ) : (
            /* ─── BACK SIDE PREVIEW ─── */
            <div className="relative bg-gradient-to-br from-arrc-950 via-arrc-800 to-arrc-950 text-white">
              <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-arrc-gold/5 -translate-y-1/3 -translate-x-1/3" />
              <div className="relative z-10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.jpg" alt="ARRC Logo" className="h-9 w-9 rounded-full border-2 border-arrc-gold object-cover" />
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-arrc-gold uppercase">African Royal Rainbow Congress</p>
                      <p className="text-[9px] text-white/50">Member Details</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-white/25 font-bold tracking-widest">BACK</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-arrc-gold/40 to-transparent mb-4" />
                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mb-4">
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Gender</p><p className="font-medium">{formatGender(member.gender)}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Date of Birth</p><p className="font-medium">{member.dateOfBirth || "—"}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">ID Number</p><p className="font-mono text-white/80 text-[11px]">{member.idNumber || "—"}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Province</p><p className="font-medium">{member.province}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Ward / Branch</p><p className="font-medium">{member.wardBranch || "—"}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Occupation</p><p className="font-medium">{member.occupation || "—"}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Email</p><p className="font-medium truncate text-[11px]">{member.email || "—"}</p></div>
                  <div><p className="text-[8px] text-white/50 uppercase tracking-widest">Phone</p><p className="font-medium">{member.phone || "—"}</p></div>
                </div>
                <div className="text-xs mb-3"><p className="text-[8px] text-white/50 uppercase tracking-widest">Address</p><p className="font-medium">{member.address || "—"}</p></div>
                <div className="h-px bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent mb-3" />
                {/* Terms */}
                <div className="space-y-1 mb-3">
                  <p className="text-[9px] font-bold text-arrc-gold uppercase tracking-widest">Terms & Conditions</p>
                  <p className="text-[8px] text-white/40">• This card remains the property of ARRC.</p>
                  <p className="text-[8px] text-white/40">• Valid 1 year from issue. Renew annually.</p>
                  <p className="text-[8px] text-white/40">• If found, return to nearest ARRC branch.</p>
                </div>
                <div className="h-px bg-white/10 mb-2" />
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-white/35">Capitec | Acc: 2544478930 | Ref: ARRC + ID</span>
                  <span className="text-arrc-gold font-bold text-sm">R20/YEAR</span>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-arrc-gold/60 via-arrc-gold/30 to-arrc-gold/60" />
            </div>
          )}
        </div>

        {/* Flip button */}
        <div className="flex justify-center mt-3">
          <Button variant="outline" size="sm" onClick={() => setShowBack(!showBack)} className="gap-2">
            <FlipHorizontal className="h-4 w-4" />
            {showBack ? "Show Front" : "Show Back"}
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={handleDownload} className="flex-1 bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold">
          <Download className="h-4 w-4 mr-2" />
          Download Card
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Print Card
        </Button>
      </div>
    </div>
  );
}
