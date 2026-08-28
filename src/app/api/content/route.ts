import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureContentSeeded } from "@/lib/auto-seed";
import { getStaticContentSnapshot, type ContentItemDTO } from "@/lib/seed-data";

/**
 * GET /api/content?type=event&status=published
 * Public endpoint to fetch published content items.
 * Returns items grouped by type if no type filter is specified.
 *
 * ─── Resilience + freshness model (why the live site always shows new media) ───
 *
 * The public site must NEVER appear blank OR stale on the live deployment.
 * Content lives in two places:
 *   1. The seed-data module (`getStaticContentSnapshot`) — the single source of
 *      truth, pure data, always current with the latest commits (new videos,
 *      July events, news articles, etc.).
 *   2. The production database (SQLite on sandbox, PostgreSQL on Vercel) —
 *      auto-seeded on writable filesystems, manually reseeded on Vercel.
 *
 * Problem this solves: the Vercel Postgres DB is seeded manually and can lag
 * behind the seed-data module (e.g. the Kaalfontein video was added to
 * seed-data but the DB still only had the two old videos). Because the DB
 * returned *some* rows, the old "DB-or-fallback" logic served the stale DB
 * content and the new videos never appeared.
 *
 * Solution: MERGE the DB items with the static snapshot. The DB items are
 * kept (respecting any admin edits/additions), and any seed-data items whose
 * title is NOT already in the DB are APPENDED. This guarantees:
 *   - Every new video / event / news article in seed-data ALWAYS shows on the
 *     live site, even when the production DB hasn't been reseeded yet.
 *   - Admin edits to existing items (same title) are respected (DB wins).
 *   - Admin-added items (not in seed-data) are kept.
 *
 * If the DB is entirely unreachable (read-only FS, missing DATABASE_URL,
 * Prisma load failure, etc.) we serve the pure static snapshot so the site
 * is never blank.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const validTypes = ["event", "news", "policy", "leader", "gallery", "video", "faq", "value", "document"];

  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const typeToGroup: Record<string, string> = {
    event: "events",
    news: "news",
    policy: "policies",
    leader: "leaders",
    gallery: "gallery",
    video: "videos",
    faq: "faqs",
    value: "values",
    document: "documents",
  };

  // Always have the static snapshot available as the ultimate fallback / supplement.
  const snapshot = getStaticContentSnapshot();

  // Content types where seed-data is AUTHORITATIVE (DB items are ignored).
  // These types previously contained AI-generated stock images that were
  // removed from seed-data. Since the production DB may still hold those
  // stale AI-image rows, merging would keep them alive. Making seed-data
  // authoritative guarantees only the curated, real-photo items render.
  // (Admin text edits for these types should be made in seed-data.ts.)
  const STATIC_AUTHORITATIVE = new Set(["gallery", "policies", "videos"]);

  try {
    // Auto-seed essential content on writable filesystems. Safe no-op on
    // read-only / serverless deployments (failures swallowed internally).
    await ensureContentSeeded();

    if (type) {
      // ─── Single-type query ───
      const group = typeToGroup[type] || "";
      const staticItems: ContentItemDTO[] = group ? snapshot[group] || [] : [];

      // For static-authoritative types, return seed-data directly (no DB merge).
      if (group && STATIC_AUTHORITATIVE.has(group)) {
        return NextResponse.json({ items: staticItems });
      }

      let dbItems: ContentItemDTO[] = [];
      try {
        const rows = await prisma.contentItem.findMany({
          where: { type, status: "published" },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        });
        dbItems = rows.map(mapContentToClient);
      } catch (err) {
        console.error(`[content] DB query failed for type=${type}, using static only:`, err);
      }

      const merged = mergeWithStatic(dbItems, staticItems);
      return NextResponse.json({ items: merged });
    }

    // ─── Grouped (all-types) query ───
    let dbItems: ContentItemDTO[] = [];
    try {
      const rows = await prisma.contentItem.findMany({
        where: { status: "published" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      dbItems = rows.map(mapContentToClient);
    } catch (err) {
      console.error("[content] DB query failed, serving static snapshot only:", err);
      return NextResponse.json(snapshot);
    }

    // Group DB items by type, then merge each group with the static snapshot.
    const grouped: Record<string, ContentItemDTO[]> = {
      events: [], news: [], policies: [], leaders: [], gallery: [],
      videos: [], faqs: [], values: [], documents: [],
    };
    for (const item of dbItems) {
      const key = typeToGroup[item.type];
      if (key) grouped[key].push(item);
    }
    for (const key of Object.keys(grouped)) {
      // For static-authoritative types, use seed-data directly (no DB merge).
      if (STATIC_AUTHORITATIVE.has(key)) {
        grouped[key] = snapshot[key] || [];
      } else {
        grouped[key] = mergeWithStatic(grouped[key], snapshot[key] || []);
      }
    }
    return NextResponse.json(grouped);
  } catch (err) {
    console.error("[content] Unexpected error, serving static snapshot:", err);
    return NextResponse.json(snapshot, { status: 200 });
  }
}

/**
 * Merge DB items with static-snapshot items.
 *
 * DB items are kept (respecting admin text edits + admin-added items). Any
 * seed-data item whose title is NOT already present in the DB is appended,
 * guaranteeing new content always renders on the live site even when the
 * production DB hasn't been reseeded.
 *
 * IMAGE URL OVERRIDE: For any DB item whose title matches a seed-data item,
 * the seed-data `imageUrl` always wins. Rationale: images are version-
 * controlled static assets that deploy with the code (and are restored from
 * /upload by auto-seed on the sandbox). The DB `imageUrl` column can lag
 * behind (e.g. a stale Supabase URL after a leader photo is updated in the
 * repo). Text fields (description, content, etc.) from the DB are still
 * respected so admin edits survive — only the image is reconciled to the
 * canonical committed asset. This guarantees that when a leader's photo is
 * updated in seed-data + /public, it appears on the live site immediately
 * without a manual DB reseed.
 *
 * LEADER RENAME RECONCILIATION: Leaders are also matched by subtitle (role)
 * as a secondary key. When a leader is renamed in seed-data (e.g.
 * "Tshepo Aaron Khaya Matsimela" → "Aaron Matsimela"), the DB row still has
 * the old title. Without subtitle matching, the merge would keep the old DB
 * row AND append the renamed seed-data row — producing a duplicate. By
 * matching on subtitle ("Chairperson"), the DB row is recognised as the same
 * person and reconciled: seed-data title + imageUrl win, DB description is
 * kept. This makes the leadership roster fully canonical from seed-data while
 * still tolerating a stale production DB.
 *
 * Dedup key: lowercased + trimmed title for all types; subtitle for leaders
 * as a secondary reconcile key.
 */
function mergeWithStatic(dbItems: ContentItemDTO[], staticItems: ContentItemDTO[]): ContentItemDTO[] {
  if (!staticItems || staticItems.length === 0) return dbItems;
  if (!dbItems || dbItems.length === 0) return staticItems;

  // Build reconciliation maps from the seed-data snapshot:
  //  - title → full seed-data item (for imageUrl override on title match)
  //  - subtitle → full seed-data item, leaders only (for rename reconciliation)
  const staticByTitle = new Map<string, ContentItemDTO>();
  const staticLeaderBySubtitle = new Map<string, ContentItemDTO>();
  for (const s of staticItems) {
    const t = (s.title || "").trim().toLowerCase();
    if (t) staticByTitle.set(t, s);
    if (s.type === "leader") {
      const sub = (s.subtitle || "").trim().toLowerCase();
      if (sub) staticLeaderBySubtitle.set(sub, s);
    }
  }

  // Track which seed-data items have been matched (by title) so they aren't
  // appended again as supplemental.
  const matchedStaticTitles = new Set<string>();
  const reconciledDb = dbItems.map((item) => {
    const t = (item.title || "").trim().toLowerCase();

    // 1. Exact title match — override imageUrl with seed-data value (even if
    //    null, which means "no image" — clears stale AI-generated DB images).
    const byTitle = t ? staticByTitle.get(t) : undefined;
    if (byTitle) {
      matchedStaticTitles.add(t);
      return { ...item, imageUrl: byTitle.imageUrl };
    }

    // 2. Leaders with no title match — try subtitle (role) match. This
    //    handles renames: seed-data title + imageUrl win, DB description kept.
    if (item.type === "leader") {
      const sub = (item.subtitle || "").trim().toLowerCase();
      const bySub = sub ? staticLeaderBySubtitle.get(sub) : undefined;
      if (bySub) {
        matchedStaticTitles.add((bySub.title || "").trim().toLowerCase());
        return {
          ...item,
          title: bySub.title,
          imageUrl: bySub.imageUrl,
        };
      }
    }

    return item;
  });

  // Append any seed-data item whose title wasn't matched above.
  const supplemental = staticItems.filter((s) => {
    const t = (s.title || "").trim().toLowerCase();
    return t && !matchedStaticTitles.has(t);
  });
  return [...reconciledDb, ...supplemental];
}

function mapContentToClient(row: {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  category: string | null;
  date: string | null;
  location: string | null;
  status: string;
  featured: boolean;
  sortOrder: number;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContentItemDTO {
  let metadata: Record<string, unknown> = {};
  if (row.metadata) {
    try {
      metadata = JSON.parse(row.metadata);
    } catch {
      metadata = {};
    }
  }

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle || null,
    description: row.description || null,
    content: row.content || null,
    imageUrl: row.imageUrl || null,
    category: row.category || null,
    date: row.date || null,
    location: row.location || null,
    status: row.status,
    featured: row.featured || false,
    sortOrder: row.sortOrder || 0,
    metadata,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
