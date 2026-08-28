import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function safeExt(name: string): string {
  const ext = (name.split(".").pop() || "png").toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"].includes(ext)) return ext;
  return "png";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!memberId) return NextResponse.json({ error: "No memberId provided" }, { status: 400 });

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = safeExt(file.name);
    const fileName = `proof-${memberId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    const publicUrl = `/uploads/${fileName}?t=${Date.now()}`;

    // Update member
    await prisma.member.update({
      where: { id: memberId },
      data: { proofOfPaymentUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl, path: `uploads/${fileName}` });
  } catch (error) {
    console.error("[upload-proof] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
