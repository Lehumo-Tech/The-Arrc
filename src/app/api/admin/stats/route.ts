import { NextRequest, NextResponse } from "next/server";
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

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function startOfWeek(d: Date): Date {
  // Week starts on Monday
  const day = d.getDay(); // 0 = Sunday … 6 = Saturday
  const diff = (day === 0 ? 6 : day - 1);
  const start = startOfDay(d);
  start.setDate(start.getDate() - diff);
  return start;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Auto-expire membership cards whose expiryDate has passed
    try {
      const now = new Date();
      await prisma.membershipCard.updateMany({
        where: {
          status: "active",
          expiryDate: { not: null, lt: now },
        },
        data: { status: "expired" },
      });
    } catch (expiryErr) {
      console.error("[admin/stats] Auto-expire check failed:", expiryErr);
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      suspendedMembers,
      expiredMembers,
      paymentConfirmed,
      paymentPending,
      newToday,
      newThisWeek,
      newThisMonth,
      recentMembersRaw,
      provinceGroups,
      totalVolunteers,
      totalDonations,
      donationAggregate,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { membershipStatus: "active" } }),
      prisma.member.count({ where: { membershipStatus: "pending" } }),
      prisma.member.count({ where: { membershipStatus: "suspended" } }),
      prisma.member.count({ where: { membershipStatus: "expired" } }),
      prisma.member.count({ where: { paymentStatus: "confirmed" } }),
      prisma.member.count({ where: { paymentStatus: "pending" } }),
      prisma.member.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.member.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.member.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.member.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.member.groupBy({ by: ["province"], _count: true }),
      prisma.volunteer.count().catch(() => 0),
      prisma.donation.count().catch(() => 0),
      prisma.donation
        .aggregate({ _sum: { amount: true } })
        .catch(() => ({ _sum: { amount: 0 } })),
    ]);

    const provinceBreakdown = provinceGroups
      .map((g) => ({ province: g.province || "Unknown", count: g._count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalMembers,
      activeMembers,
      pendingMembers,
      suspendedMembers,
      expiredMembers,
      paymentConfirmed,
      paymentPending,
      newToday,
      newThisWeek,
      newThisMonth,
      provinceBreakdown,
      recentMembers: recentMembersRaw.map(mapMemberToClient),
      totalVolunteers,
      totalDonations,
      totalRaised: donationAggregate._sum.amount || 0,
      supabaseConfigured: false,
    });
  } catch (error) {
    console.error("[admin/stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
