import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import { randomUUID } from "crypto";

/**
 * Generate an explicit UUID for the id field.
 * Production Postgres has `id` columns as UUID type (from an older schema),
 * so Prisma's default CUID generation fails with "Error creating UUID".
 * Providing an explicit UUID works regardless of column type.
 */
function uuid() {
  return randomUUID();
}

/**
 * POST /api/admin/reseed-content
 *
 * Force-seeds events, news, and documents into the database. Idempotent —
 * skips items that already exist (matched by title + date).
 *
 * This endpoint exists because the auto-seed in ensureContentSeeded() can
 * time out on serverless (Vercel) when doing 50+ sequential inserts to
 * Postgres before reaching seedEvents(). This endpoint does targeted,
 * efficient batch inserts of just the missing content types.
 *
 * Requires admin authentication (Bearer token from /api/admin/login).
 */
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const MEDIA_BASE =
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uguyorpawowezxlfeaug.supabase.co") +
    "/storage/v1/object/public/media";

  const result = {
    events: { inserted: 0, skipped: 0, total: 0 },
    news: { inserted: 0, skipped: 0, total: 0 },
    documents: { inserted: 0, skipped: 0, total: 0 },
    errors: [] as string[],
  };

  /* ─── EVENTS ─── */
  const events = [
    { title: "March in Moretele — #Abahambe", description: "A peaceful community march through Moretele. Route: Makapanstad → Mathibestad → Danhouse. Together we stand, together we win. NO WEAPONS ALLOWED. March peacefully, march responsibly.", imageUrl: "/events/moretele-march.jpeg", category: "Community March", date: "2026-07-09", location: "Makapanstad, Moretele (North-West)", featured: true, sortOrder: 1 },
    { title: "Tshwane Door-to-Door — Ward 07 (Nkomo Village)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Nkomo Village, Ward 07. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-11", location: "Ward 07, Nkomo Village (Tshwane)", featured: false, sortOrder: 2 },
    { title: "Tshwane Door-to-Door — Ward 68 (Saulsville Station)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Saulsville Station, Ward 68. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-12", location: "Ward 68, Saulsville Station (Tshwane)", featured: false, sortOrder: 3 },
    { title: "Vaal 2587 Phase 3 — Tshepiso Sharpeville Door to Door", description: "Door-to-door community engagement in Vaal 2587 Phase 3, Tshepiso Sharpeville. Connecting with residents around jobs & opportunities, education & skills, safe & strong communities, and economic growth. Together we can build a better future!", imageUrl: "/events/vaal-tshepiso-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-18", location: "Vaal 2587 Phase 3, Tshepiso Sharpeville", featured: false, sortOrder: 4 },
    { title: "Tshwane Door-to-Door — Ward 107 (Dumping)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Dumping, Ward 107. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-18", location: "Ward 107, Dumping (Tshwane)", featured: false, sortOrder: 5 },
    { title: "Tshwane Door-to-Door — Ward 71 (Marastart)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Marastart, Ward 71. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-19", location: "Ward 71, Marastart (Tshwane)", featured: false, sortOrder: 6 },
    { title: "Tshwane Door-to-Door — Ward 72 (White House)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: White House, Ward 72. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-25", location: "Ward 72, White House (Tshwane)", featured: false, sortOrder: 7 },
    { title: "March with Purpose — March for Our Future", description: "A national call to peaceful, responsible mobilization. Our voice. Our rights. Our South Africa. Let your voice be heard — peacefully. Stay safe. Stand united. Date and venue to be announced.", imageUrl: "/events/march-with-purpose.jpeg", category: "National Mobilization", date: "Date to be announced", location: "South Africa (venue TBA)", featured: false, sortOrder: 8 },
    { title: "Final Voter Registration Weekend — President Thabiso Mabetwa", description: "The ARRC calls on all eligible South Africans to register to vote during the final voter registration weekend. Your voice. Your rights. Our future. Register to vote on 4 November.", imageUrl: "/events/voter-registration-weekend-president.jpeg", category: "Voter Registration", date: "2026-08-01", location: "Nationwide (all IEC voting stations)", featured: true, sortOrder: 9 },
    { title: "Final Voter Registration Weekend — Deputy President Calvin Nkosi", description: "Deputy President Calvin Nkosi joins the call for mass voter registration. Final registration weekend: 1–2 August 2026, from 8AM to 5PM. Register to vote on 4 November.", imageUrl: "/events/voter-registration-weekend-deputy-president.jpeg", category: "Voter Registration", date: "2026-08-01", location: "Nationwide (all IEC voting stations)", featured: false, sortOrder: 10 },
    { title: "Ward 92 Candidate — Maropeng Flora Setwaba (Moretele)", description: "ARRC Ward 92 candidate Maropeng Flora Setwaba leads voter registration mobilization in Moretele. Final voter registration weekend: 1–2 August 2026, from 8AM to 5PM.", imageUrl: "/events/ward-92-candidate-moretele.jpeg", category: "Voter Registration", date: "2026-08-01", location: "Ward 92, Moretele (North-West)", featured: false, sortOrder: 11 },
    { title: "Door-to-Door Activation — Soweto Ward 14 (Naledi Ext 2)", description: "The ARRC goes to every home in Soweto to listen, engage, and serve. Door-to-door activation in Ward 14, Naledi Ext 2. 96a Mthini Street, Soweto.", imageUrl: "/events/door-to-door-soweto-ward-14.jpeg", category: "Door-to-Door Mobilization", date: "2026-08-15", location: "96a Mthini Street, Naledi Ext 2, Soweto (Ward 14)", featured: false, sortOrder: 12 },
    { title: "Door to Door Campaign — Mathibestad", description: "ARRC volunteers take our movement to the people of Mathibestad, North-West Province. Listening to residents, engaging with communities, and delivering real solutions. Bojanala District, Moretele Local Municipality, Ward 18.", imageUrl: "/campaigns/door-to-door-campaign.jpeg", category: "Community Outreach", date: "2026-07-04", location: "Mathibestad, North-West Province", featured: false, sortOrder: 50 },
    { title: "Community Engagement Forum", description: "ARRC hosted a community engagement forum to hear directly from residents about local issues, service delivery, and the challenges facing our communities. A platform for the people's voice.", imageUrl: "/news/news-community-2026.jpg", category: "Community Forum", date: "2026-06-28", location: "Soshanguve, Gauteng", featured: false, sortOrder: 51 },
    { title: "Youth Leadership Workshop", description: "The ARRC Youth League hosted a leadership workshop empowering young South Africans with skills in community organising, civic participation, and advocacy. Building tomorrow's leaders today.", imageUrl: "/news/news-youth-2026.jpg", category: "Youth Development", date: "2026-06-26", location: "Mamelodi, Gauteng", featured: false, sortOrder: 52 },
    { title: "Volunteer Mobilization Drive", description: "ARRC volunteer teams mobilised across communities for a weekend of door-to-door outreach, voter registration assistance, and community service. Together we build better communities.", imageUrl: "/news/news-door-to-door.jpg", category: "Volunteer Drive", date: "2026-06-24", location: "Tembisa, Gauteng", featured: false, sortOrder: 54 },
  ];

  try {
    for (const e of events) {
      const dup = await prisma.contentItem.findFirst({
        where: { type: "event", title: e.title, date: e.date },
        select: { id: true },
      });
      if (dup) {
        result.events.skipped++;
        continue;
      }
      await prisma.contentItem.create({
        data: { id: uuid(), type: "event", title: e.title, subtitle: null, description: e.description, content: null, imageUrl: e.imageUrl, category: e.category, date: e.date, location: e.location, status: "published", featured: e.featured, sortOrder: e.sortOrder, metadata: "{}" },
      });
      result.events.inserted++;
    }
    result.events.total = await prisma.contentItem.count({ where: { type: "event" } });
  } catch (err) {
    result.errors.push(`events: ${err instanceof Error ? err.message : String(err)}`);
  }

  /* ─── NEWS ─── */
  const news = [
    { title: "ARRC Launches National Door-to-Door Campaign", description: "The African Royal Rainbow Congress has launched a nationwide door-to-door campaign to mobilise communities across South Africa.", imageUrl: "/news/news-door-to-door.jpg", category: "Campaign", date: "2026-07-01", sortOrder: 1 },
    { title: "Historic Rally Draws Thousands in Pretoria", description: "Thousands of ARRC supporters gathered in Pretoria for a historic rally calling for economic freedom and community safety.", imageUrl: "/news/news-rally-2026.jpg", category: "Rally", date: "2026-06-20", sortOrder: 2 },
    { title: "New Policy Framework Released", description: "The ARRC has released a comprehensive new policy framework addressing education, healthcare, and economic development.", imageUrl: "/news/news-policy-2026.jpg", category: "Policy", date: "2026-06-15", sortOrder: 3 },
    { title: "Youth League National Conference Success", description: "The ARRC Youth League held its first national conference, electing new leadership and setting the agenda for youth empowerment.", imageUrl: "/news/news-youth-2026.jpg", category: "Youth", date: "2026-06-10", sortOrder: 4 },
    { title: "Community Engagement Forum Success", description: "ARRC hosted a successful community engagement forum, hearing directly from residents about local issues and service delivery.", imageUrl: "/news/news-community-2026.jpg", category: "Community", date: "2026-06-05", sortOrder: 5 },
  ];

  try {
    for (const n of news) {
      const dup = await prisma.contentItem.findFirst({
        where: { type: "news", title: n.title },
        select: { id: true },
      });
      if (dup) {
        result.news.skipped++;
        continue;
      }
      await prisma.contentItem.create({
        data: { id: uuid(), type: "news", title: n.title, subtitle: null, description: n.description, content: null, imageUrl: n.imageUrl, category: n.category, date: n.date, location: null, status: "published", featured: false, sortOrder: n.sortOrder, metadata: "{}" },
      });
      result.news.inserted++;
    }
    result.news.total = await prisma.contentItem.count({ where: { type: "news" } });
  } catch (err) {
    result.errors.push(`news: ${err instanceof Error ? err.message : String(err)}`);
  }

  /* ─── DOCUMENTS ─── */
  const documents = [
    { title: "ARRC Constitution", description: "The founding constitution of the African Royal Rainbow Congress.", category: "Constitution", sortOrder: 1, pdfId: "arrc-constitution", icon: "FileText" },
    { title: "Membership Form", description: "Download the official ARRC membership application form.", category: "Form", sortOrder: 2, pdfId: "arrc-membership-form", icon: "FileText" },
    { title: "Policy Framework 2026", description: "Comprehensive policy framework outlining ARRC's vision for South Africa.", category: "Policy", sortOrder: 3, pdfId: "arrc-policy-framework", icon: "FileText" },
    { title: "Annual Report 2025", description: "ARRC's annual report covering activities, achievements, and financials for 2025.", category: "Report", sortOrder: 4, pdfId: "arrc-annual-report", icon: "FileText" },
    { title: "Code of Conduct", description: "The ARRC code of conduct for members and officials.", category: "Governance", sortOrder: 5, pdfId: "arrc-code-of-conduct", icon: "FileText" },
  ];

  try {
    for (const d of documents) {
      const dup = await prisma.contentItem.findFirst({
        where: { type: "document", title: d.title },
        select: { id: true },
      });
      if (dup) {
        result.documents.skipped++;
        continue;
      }
      await prisma.contentItem.create({
        data: { id: uuid(), type: "document", title: d.title, subtitle: null, description: d.description, content: null, imageUrl: null, category: d.category, status: "published", featured: false, sortOrder: d.sortOrder, metadata: JSON.stringify({ pdfId: d.pdfId, icon: d.icon }) },
      });
      result.documents.inserted++;
    }
    result.documents.total = await prisma.contentItem.count({ where: { type: "document" } });
  } catch (err) {
    result.errors.push(`documents: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({ success: true, ...result });
}
