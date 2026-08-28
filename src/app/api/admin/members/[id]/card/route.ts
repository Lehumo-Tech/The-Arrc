import { NextRequest, NextResponse } from "next/server";
import { generateMemberId } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

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

/**
 * Generate a unique card number in format ARRC-{6-char-uppercase-alphanumeric}
 */
function generateCardNumber(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ARRC-${code}`;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(_req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch current member
    const dbMember = await prisma.member.findUnique({ where: { id } });
    if (!dbMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const memberId = dbMember.memberId || generateMemberId(dbMember.id);

    // Activate member and mark card as generated
    const updateData: {
      memberId: string;
      cardGenerated: boolean;
      membershipStatus?: string;
      paymentStatus?: string;
    } = {
      memberId,
      cardGenerated: true,
    };

    if (dbMember.membershipStatus === "pending") {
      updateData.membershipStatus = "active";
    }
    if (dbMember.paymentStatus === "pending") {
      updateData.paymentStatus = "confirmed";
    }

    const updated = await prisma.member.update({
      where: { id },
      data: updateData,
    });

    // Also create or update a MembershipCard record in Prisma
    try {
      const existingCard = await prisma.membershipCard.findUnique({
        where: { memberId: id },
      });

      if (existingCard) {
        // Reactivate if revoked/expired — this counts as a renewal
        if (existingCard.status !== "active") {
          const now = new Date();
          await prisma.membershipCard.update({
            where: { id: existingCard.id },
            data: {
              status: "active",
              issueDate: now,
              expiryDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            },
          });
        }
      } else {
        // Generate unique card number
        let cardNumber = generateCardNumber();
        let attempts = 0;
        while (attempts < 10) {
          const existing = await prisma.membershipCard.findUnique({ where: { cardNumber } });
          if (!existing) break;
          cardNumber = generateCardNumber();
          attempts++;
        }

        await prisma.membershipCard.create({
          data: {
            cardNumber,
            memberId: id,
            memberName: dbMember.firstName,
            memberSurname: dbMember.lastName,
            memberGender: dbMember.gender || "",
            memberDateOfBirth: dbMember.dateOfBirth || null,
            memberIdNumber: dbMember.idNumber || null,
            memberProvince: dbMember.province,
            memberWardBranch: dbMember.wardBranch || null,
            memberOccupation: dbMember.occupation || null,
            memberEmail: dbMember.email || null,
            memberPhone: dbMember.phone || null,
            memberAddress: dbMember.address || null,
            memberSelfieUrl: dbMember.selfieUrl || null,
            status: "active",
            cardType: "standard",
            issueDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            generatedBy: admin.displayName || admin.username,
          },
        });
      }
    } catch (cardErr) {
      console.error("[admin/members/[id]/card] MembershipCard creation error:", cardErr);
      // Don't fail the whole request — the member update already succeeded
    }

    return NextResponse.json({
      success: true,
      memberId,
      member: mapMemberToClient(updated),
    });
  } catch (error) {
    console.error("[admin/members/[id]/card] Error:", error);
    return NextResponse.json({ error: "Failed to generate card" }, { status: 500 });
  }
}
