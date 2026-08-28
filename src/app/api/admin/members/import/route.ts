import { NextRequest, NextResponse } from "next/server";
import { generateMemberId } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { members } = await req.json();
    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: "No members data provided" }, { status: 400 });
    }

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const m of members) {
      try {
        // Validate required fields
        if (!m.firstName || !m.lastName || !m.idNumber || !m.email || !m.phone || !m.dateOfBirth || !m.gender || !m.province) {
          results.errors.push(`Row skipped: missing required fields for ${m.firstName || "unknown"}`);
          results.skipped++;
          continue;
        }

        // Check for duplicate ID number
        const idCheck = await prisma.member.findFirst({
          where: { idNumber: m.idNumber },
          select: { id: true },
        });
        if (idCheck) {
          results.skipped++;
          continue;
        }

        // Check for duplicate email
        const emailCheck = await prisma.member.findFirst({
          where: { email: m.email },
          select: { id: true },
        });
        if (emailCheck) {
          results.skipped++;
          continue;
        }

        // Create member
        const member = await prisma.member.create({
          data: {
            firstName: m.firstName,
            lastName: m.lastName,
            idNumber: m.idNumber,
            email: m.email,
            phone: m.phone,
            dateOfBirth: m.dateOfBirth,
            gender: m.gender,
            address: m.address || null,
            province: m.province,
            occupation: m.occupation || null,
            wardBranch: m.wardBranch || null,
            paymentMethod: m.paymentMethod || "branch",
            paymentStatus: m.paymentStatus || "confirmed",
            membershipStatus: m.membershipStatus || "active",
            cardGenerated: m.cardGenerated || false,
            notes: m.notes || null,
          },
        });

        // Generate memberId
        const memberId = generateMemberId(member.id);
        await prisma.member.update({
          where: { id: member.id },
          data: { memberId },
        });

        results.created++;
      } catch (err) {
        results.errors.push(`Error processing ${m.firstName || "unknown"}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[import] Error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
