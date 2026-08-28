import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(_req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member: mapMemberToClient(member) });
  } catch (error) {
    console.error("[admin/members/[id]] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields: (keyof Prisma.MemberUpdateInput)[] = [
      "membershipStatus",
      "paymentStatus",
      "notes",
      "province",
      "phone",
      "email",
      "address",
      "occupation",
      "wardBranch",
      "firstName",
      "lastName",
      "selfieUrl",
      "gender",
      "dateOfBirth",
      "idNumber",
      "paymentMethod",
      "cardGenerated",
      "memberId",
      "proofOfPaymentUrl",
    ];

    const data: Prisma.MemberUpdateInput = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Narrow per-field assignment; types are intentionally relaxed here so the
        // admin CRM can patch any subset of fields.
        (data as Record<string, unknown>)[field] = body[field];
      }
    }

    const updated = await prisma.member.update({
      where: { id },
      data,
    });

    return NextResponse.json({ member: mapMemberToClient(updated) });
  } catch (error) {
    console.error("[admin/members/[id]] PATCH Error:", error);
    const isNotFound =
      error instanceof Error && /Record to update not found|not found/i.test(error.message);
    return NextResponse.json(
      { error: isNotFound ? "Member not found" : "Failed to update member" },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(_req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Delete the member's membership card first (FK constraint — member_id is unique)
    try {
      await prisma.membershipCard.delete({ where: { memberId: id } });
    } catch {
      // No card to delete — ignore
    }

    await prisma.member.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/members/[id]] DELETE Error:", error);
    const isNotFound =
      error instanceof Error && /Record to delete not found|not found/i.test(error.message);
    return NextResponse.json(
      { error: isNotFound ? "Member not found" : "Failed to delete member" },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
