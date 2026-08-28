import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/content?type=event&status=draft
 * List all content items, optionally filtered by type and status.
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.contentItem.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map(mapContentToClient),
      total,
    });
  } catch (err) {
    console.error("Content fetch error:", err);
    return NextResponse.json({ items: [], total: 0 });
  }
}

/**
 * POST /api/admin/content
 * Create a new content item.
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const validTypes = ["event", "news", "policy", "leader", "gallery", "video", "faq", "value", "document"];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const item = await prisma.contentItem.create({
      data: {
        type: body.type,
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        description: body.description?.trim() || null,
        content: body.content?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        category: body.category?.trim() || null,
        date: body.date?.trim() || null,
        location: body.location?.trim() || null,
        status: body.status || "draft",
        featured: body.featured || false,
        sortOrder: body.sortOrder || 0,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    });

    return NextResponse.json({ item: mapContentToClient(item) }, { status: 201 });
  } catch (err) {
    console.error("Content create error:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
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
}) {
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
