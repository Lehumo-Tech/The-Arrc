import { NextRequest, NextResponse } from "next/server";
import { generateMemberId } from "@/lib/supabase";
import { sendNewMemberEmail } from "@/lib/email";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      idNumber,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      province,
      occupation,
      wardBranch,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !idNumber || !email || !phone || !dateOfBirth || !gender || !province) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate ID number
    const idCheck = await prisma.member.findFirst({
      where: { idNumber },
      select: { id: true },
    });
    if (idCheck) {
      return NextResponse.json(
        { error: "A member with this ID number already exists" },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const emailCheck = await prisma.member.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (emailCheck) {
      return NextResponse.json(
        { error: "A member with this email already exists" },
        { status: 409 }
      );
    }

    // Create member in Prisma/SQLite
    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        idNumber,
        email: normalizedEmail,
        phone,
        dateOfBirth,
        gender,
        address: address || null,
        province,
        occupation: occupation || null,
        wardBranch: wardBranch || null,
        paymentMethod: paymentMethod || "online",
        paymentStatus: "pending",
        membershipStatus: "pending",
        cardGenerated: false,
      },
    });

    // Generate memberId now that we have the record ID
    const memberId = generateMemberId(member.id);
    await prisma.member.update({
      where: { id: member.id },
      data: { memberId },
    });

    // ─── Send email notification to info@arrc.co.za (no-op stub) ───
    sendNewMemberEmail({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      idNumber,
      province,
      paymentMethod: paymentMethod || "online",
      memberId,
    }).catch((err) => {
      console.error("[api/members] Email notification failed:", err);
    });

    return NextResponse.json(
      { message: "Membership application submitted successfully", id: member.id, memberId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Member registration error:", error);
    return NextResponse.json(
      { error: "Failed to process membership application" },
      { status: 500 }
    );
  }
}
