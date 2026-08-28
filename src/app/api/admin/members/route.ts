import { NextRequest, NextResponse } from "next/server";
import { generateMemberId } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

/** Map a Prisma Member row to the client-facing shape (camelCase → camelCase). */
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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const province = searchParams.get("province") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // Build where clause
    const where: Prisma.MemberWhereInput = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { idNumber: { contains: search } },
        { memberId: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (status) {
      where.membershipStatus = status;
    }
    if (province) {
      where.province = province;
    }

    const [members, totalItems] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.member.count({ where }),
    ]);

    // Ensure all have member_id (backfill if missing)
    const mappedMembers = await Promise.all(
      members.map(async (m) => {
        if (!m.memberId) {
          const mid = generateMemberId(m.id);
          try {
            await prisma.member.update({
              where: { id: m.id },
              data: { memberId: mid },
            });
            (m as { memberId: string | null }).memberId = mid;
          } catch {
            (m as { memberId: string | null }).memberId = mid;
          }
        }
        return mapMemberToClient(m);
      })
    );

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return NextResponse.json({
      members: mappedMembers,
      total: totalItems,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("[admin/members] Error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
