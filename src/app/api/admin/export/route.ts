import { NextRequest, NextResponse } from "next/server";
import { generateMemberId } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "Member ID",
      "First Name",
      "Last Name",
      "ID Number",
      "Email",
      "Phone",
      "Gender",
      "Date of Birth",
      "Province",
      "Address",
      "Occupation",
      "Ward/Branch",
      "Payment Method",
      "Payment Status",
      "Membership Status",
      "Card Generated",
      "Notes",
      "Created At",
    ];

    const escape = (v: string | null | undefined): string =>
      `"${(v ?? "").toString().replace(/"/g, '""')}"`;

    const rows = members.map((m) => [
      escape(m.memberId || generateMemberId(m.id)),
      escape(m.firstName),
      escape(m.lastName),
      escape(m.idNumber),
      escape(m.email),
      escape(m.phone),
      escape(m.gender),
      escape(m.dateOfBirth),
      escape(m.province),
      escape(m.address),
      escape(m.occupation),
      escape(m.wardBranch),
      escape(m.paymentMethod),
      escape(m.paymentStatus),
      escape(m.membershipStatus),
      escape(m.cardGenerated ? "Yes" : "No"),
      escape(m.notes),
      escape(m.createdAt.toISOString()),
    ]);

    const csv = [headers.map(escape).join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=arrc-members.csv",
      },
    });
  } catch (error) {
    console.error("[admin/export] Error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
