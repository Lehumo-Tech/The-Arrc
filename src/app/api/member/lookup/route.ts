import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/member/lookup — Public endpoint for member self-service portal.
 * Verifies member identity using ID number + email (or ID number + phone).
 * Returns member profile + membership card info (if a card exists).
 *
 * This is the "Check My Membership Status" feature (like the DA's membership portal).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idNumber, email, phone } = body;

    if (!idNumber || (!email && !phone)) {
      return NextResponse.json(
        { error: "Please provide your ID number and either your email or phone number." },
        { status: 400 }
      );
    }

    const where: { idNumber: string; email?: string; phone?: string } = { idNumber };
    if (email) {
      where.email = email.toLowerCase().trim();
    } else if (phone) {
      where.phone = phone.trim();
    }

    const member = await prisma.member.findFirst({ where });

    if (!member) {
      return NextResponse.json(
        { error: "No member found with the provided details. Please check your information or contact us for assistance." },
        { status: 404 }
      );
    }

    const mapped = {
      id: member.id,
      memberId: member.memberId || "",
      firstName: member.firstName,
      lastName: member.lastName,
      idNumber: member.idNumber,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      address: member.address,
      province: member.province,
      occupation: member.occupation,
      wardBranch: member.wardBranch,
      paymentMethod: member.paymentMethod,
      paymentStatus: member.paymentStatus,
      membershipStatus: member.membershipStatus,
      cardGenerated: member.cardGenerated,
      selfieUrl: member.selfieUrl,
      proofOfPaymentUrl: member.proofOfPaymentUrl,
      notes: member.notes,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    };

    // Look up membership card (linked by member UUID)
    let card: Record<string, unknown> | null = null;
    try {
      const cardRecord = await prisma.membershipCard.findUnique({
        where: { memberId: member.id },
      });
      if (cardRecord) {
        // Auto-expire check
        let cardStatus = cardRecord.status;
        if (cardStatus === "active" && cardRecord.expiryDate && cardRecord.expiryDate < new Date()) {
          cardStatus = "expired";
          await prisma.membershipCard.update({
            where: { id: cardRecord.id },
            data: { status: "expired" },
          });
        }

        card = {
          cardNumber: cardRecord.cardNumber,
          status: cardStatus,
          cardType: cardRecord.cardType,
          issueDate: cardRecord.issueDate.toISOString(),
          expiryDate: cardRecord.expiryDate?.toISOString() || null,
          memberName: cardRecord.memberName,
          memberSurname: cardRecord.memberSurname,
          memberGender: cardRecord.memberGender,
          memberDateOfBirth: cardRecord.memberDateOfBirth,
          memberIdNumber: cardRecord.memberIdNumber,
          memberProvince: cardRecord.memberProvince,
          memberWardBranch: cardRecord.memberWardBranch,
          memberOccupation: cardRecord.memberOccupation,
          memberEmail: cardRecord.memberEmail,
          memberPhone: cardRecord.memberPhone,
          memberAddress: cardRecord.memberAddress,
          memberSelfieUrl: cardRecord.memberSelfieUrl,
        };
      }
    } catch {
      // Card table may not exist — ignore
    }

    return NextResponse.json({
      member: mapped,
      card,
    });
  } catch (error) {
    console.error("[api/member/lookup] POST error:", error);
    return NextResponse.json(
      { error: "Failed to look up member. Please try again." },
      { status: 500 }
    );
  }
}
