import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, idNumber } = body;

    if (!email && !idNumber) {
      return NextResponse.json(
        { error: "Please provide your email or ID number" },
        { status: 400 }
      );
    }

    // Build query - search by email OR id_number
    const where = email
      ? { email: email.trim().toLowerCase() }
      : { idNumber: idNumber.trim() };

    const member = await prisma.member.findFirst({ where });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found. Please check your details or register first." },
        { status: 404 }
      );
    }

    // Return limited info for privacy (no full ID number, no notes, no phone)
    return NextResponse.json({
      member: {
        id: member.id,
        memberId: member.memberId || "",
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        province: member.province,
        membershipStatus: member.membershipStatus,
        paymentStatus: member.paymentStatus,
        cardGenerated: member.cardGenerated,
        selfieUrl: member.selfieUrl,
        createdAt: member.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Member lookup error:", error);
    return NextResponse.json(
      { error: "Lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
