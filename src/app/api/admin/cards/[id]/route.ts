import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Map a Prisma MembershipCard row to a client-facing shape.
 */
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

/**
 * GET /api/admin/cards/[id]
 * Get a single membership card by ID.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const card = await prisma.membershipCard.findUnique({ where: { id } });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ card: mapCardToClient(card) });
  } catch (err) {
    console.error("[admin/cards/[id]] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/cards/[id]
 * Update a membership card (status, cardType, notes, expiryDate).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const validStatuses = ["active", "expired", "revoked", "pending"];
    const validCardTypes = ["standard", "premium", "honorary"];

    if (body.status !== undefined && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be active, expired, revoked, or pending" },
        { status: 400 }
      );
    }

    if (body.cardType !== undefined && !validCardTypes.includes(body.cardType)) {
      return NextResponse.json(
        { error: "Invalid card type. Must be standard, premium, or honorary" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.cardType !== undefined) updateData.cardType = body.cardType;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;

    const card = await prisma.membershipCard.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ card: mapCardToClient(card) });
  } catch (err) {
    console.error("[admin/cards/[id]] PATCH error:", err);
    // Prisma throws P2025 when record not found
    const isNotFound = err instanceof Error && err.message.includes("Record to update not found");
    if (isNotFound) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update card" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/cards/[id]
 * Delete a membership card (only if status is pending or revoked).
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const card = await prisma.membershipCard.findUnique({ where: { id } });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Only allow deletion of pending or revoked cards
    if (card.status !== "pending" && card.status !== "revoked") {
      return NextResponse.json(
        { error: "Cannot delete card. Only cards with 'pending' or 'revoked' status can be deleted." },
        { status: 403 }
      );
    }

    await prisma.membershipCard.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Card deleted successfully" });
  } catch (err) {
    console.error("[admin/cards/[id]] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
