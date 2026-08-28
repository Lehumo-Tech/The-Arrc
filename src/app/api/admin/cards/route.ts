import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateMemberId } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

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

/** Map a Prisma MembershipCard row to a client-facing shape. */
function mapCardToClient(row: {
  id: string;
  cardNumber: string;
  memberId: string;
  memberName: string;
  memberSurname: string;
  memberGender: string;
  memberDateOfBirth: string | null;
  memberIdNumber: string | null;
  memberProvince: string;
  memberWardBranch: string | null;
  memberOccupation: string | null;
  memberEmail: string | null;
  memberPhone: string | null;
  memberAddress: string | null;
  memberSelfieUrl: string | null;
  status: string;
  cardType: string;
  issueDate: Date;
  expiryDate: Date | null;
  generatedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    cardNumber: row.cardNumber,
    memberId: row.memberId,
    memberName: row.memberName,
    memberSurname: row.memberSurname,
    memberGender: row.memberGender,
    memberDateOfBirth: row.memberDateOfBirth,
    memberIdNumber: row.memberIdNumber,
    memberProvince: row.memberProvince,
    memberWardBranch: row.memberWardBranch,
    memberOccupation: row.memberOccupation,
    memberEmail: row.memberEmail,
    memberPhone: row.memberPhone,
    memberAddress: row.memberAddress,
    selfieUrl: row.memberSelfieUrl,
    status: row.status,
    cardType: row.cardType,
    issueDate: row.issueDate.toISOString(),
    expiryDate: row.expiryDate ? row.expiryDate.toISOString() : null,
    generatedBy: row.generatedBy,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
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

/**
 * GET /api/admin/cards?status=active&search=ARRC&page=1&limit=20
 * List all membership cards with optional filters and pagination.
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  try {
    // Auto-expire cards whose expiryDate has passed
    const now = new Date();
    await prisma.membershipCard.updateMany({
      where: {
        status: "active",
        expiryDate: { not: null, lt: now },
      },
      data: { status: "expired" },
    });

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { cardNumber: { contains: search } },
        { memberName: { contains: search } },
        { memberSurname: { contains: search } },
        { memberId: { contains: search } },
      ];
    }

    const [cards, total] = await Promise.all([
      prisma.membershipCard.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.membershipCard.count({ where }),
    ]);

    return NextResponse.json({
      cards: cards.map(mapCardToClient),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[admin/cards] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}

/**
 * POST /api/admin/cards
 * Create a new membership card for a member.
 *
 * Body: { memberId (Prisma Member.id), cardType?, notes?, expiryDate? }
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memberId: prismaId, cardType, notes, expiryDate } = body;

    if (!prismaId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const validCardTypes = ["standard", "premium", "honorary"];
    if (cardType && !validCardTypes.includes(cardType)) {
      return NextResponse.json(
        { error: "Invalid card type. Must be standard, premium, or honorary" },
        { status: 400 }
      );
    }

    // Check if a card already exists for this member
    const existingCard = await prisma.membershipCard.findUnique({
      where: { memberId: prismaId },
    });
    if (existingCard) {
      return NextResponse.json(
        { error: "A membership card already exists for this member", card: mapCardToClient(existingCard) },
        { status: 409 }
      );
    }

    // Fetch member from Prisma
    const dbMember = await prisma.member.findUnique({ where: { id: prismaId } });
    if (!dbMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Generate unique card number (retry if collision)
    let cardNumber = generateCardNumber();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.membershipCard.findUnique({ where: { cardNumber } });
      if (!existing) break;
      cardNumber = generateCardNumber();
      attempts++;
    }
    if (attempts >= 10) {
      return NextResponse.json({ error: "Failed to generate unique card number" }, { status: 500 });
    }

    // Generate the memberId for ARRC display (ARRC-XXXXXX format)
    const arrcMemberId = dbMember.memberId || generateMemberId(dbMember.id);

    // Update member: set memberId, cardGenerated, and activate if pending
    const updateData: {
      memberId: string;
      cardGenerated: boolean;
      membershipStatus?: string;
      paymentStatus?: string;
    } = {
      memberId: arrcMemberId,
      cardGenerated: true,
    };
    if (dbMember.membershipStatus === "pending") {
      updateData.membershipStatus = "active";
    }
    if (dbMember.paymentStatus === "pending") {
      updateData.paymentStatus = "confirmed";
    }

    const updatedMember = await prisma.member.update({
      where: { id: prismaId },
      data: updateData,
    });

    // Create the MembershipCard record in Prisma — persist the member's selfie
    // URL at the time of card generation so the card never changes if the member
    // later updates their photo.
    const card = await prisma.membershipCard.create({
      data: {
        cardNumber,
        memberId: prismaId,
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
        cardType: cardType || "standard",
        issueDate: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        generatedBy: admin.displayName || admin.username,
        notes: notes || null,
      },
    });

    return NextResponse.json(
      {
        card: mapCardToClient(card),
        member: mapMemberToClient(updatedMember),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[admin/cards] POST error:", err);
    return NextResponse.json({ error: "Failed to create membership card" }, { status: 500 });
  }
}
