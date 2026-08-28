import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function safeExt(name: string): string {
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)) return ext;
  return "jpg";
}

/** Map a Prisma Member row to the client-facing shape. */
function mapMemberToClient(m: {
  id: string;
  memberId: string | null;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  province: string;
  occupation: string | null;
  wardBranch: string | null;
  paymentMethod: string;
  paymentStatus: string;
  membershipStatus: string;
  cardGenerated: boolean;
  selfieUrl: string | null;
  proofOfPaymentUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: m.id,
    memberId: m.memberId || "",
    firstName: m.firstName,
    lastName: m.lastName,
    idNumber: m.idNumber,
    email: m.email,
    phone: m.phone,
    dateOfBirth: m.dateOfBirth,
    gender: m.gender,
    address: m.address,
    province: m.province,
    occupation: m.occupation,
    wardBranch: m.wardBranch,
    paymentMethod: m.paymentMethod,
    paymentStatus: m.paymentStatus,
    membershipStatus: m.membershipStatus,
    cardGenerated: m.cardGenerated,
    selfieUrl: m.selfieUrl,
    proofOfPaymentUrl: m.proofOfPaymentUrl,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!memberId) return NextResponse.json({ error: "No memberId provided" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or HEIC image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = safeExt(file.name);
    const fileName = `selfie-${memberId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    const publicUrl = `/uploads/${fileName}?t=${Date.now()}`;

    // Update member record
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { selfieUrl: publicUrl },
    });

    return NextResponse.json({
      url: publicUrl,
      path: `uploads/${fileName}`,
      member: mapMemberToClient(updated),
    });
  } catch (error) {
    console.error("[admin/upload-selfie] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
