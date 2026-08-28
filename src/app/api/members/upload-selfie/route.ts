import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function safeExt(name: string): string {
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  // Restrict to known image extensions to avoid path traversal / odd types
  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)) return ext;
  return "jpg";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!memberId) return NextResponse.json({ error: "No memberId provided" }, { status: 400 });

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or HEIC image." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
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
    const fileName = `selfie-${memberId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    // Add cache-busting timestamp so the browser fetches the latest version
    const publicUrl = `/uploads/${fileName}?t=${Date.now()}`;

    // Update member record with selfie URL
    await prisma.member.update({
      where: { id: memberId },
      data: { selfieUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl, path: `uploads/${fileName}` });
  } catch (error) {
    console.error("[upload-selfie] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
