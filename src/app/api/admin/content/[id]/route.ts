import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/content/[id]
 * Get a single content item by ID.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const item = await prisma.contentItem.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  return NextResponse.json({ item: mapContentToClient(item) });
}

/**
 * PATCH /api/admin/content/[id]
 * Update a content item.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.content !== undefined) updateData.content = body.content?.trim() || null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl?.trim() || null;
    if (body.category !== undefined) updateData.category = body.category?.trim() || null;
    if (body.date !== undefined) updateData.date = body.date?.trim() || null;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.metadata !== undefined) updateData.metadata = JSON.stringify(body.metadata);

    const item = await prisma.contentItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ item: mapContentToClient(item) });
  } catch (err) {
    console.error("Content update error:", err);
    return NextResponse.json({ error: "Invalid request body or item not found" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/content/[id]
 * Delete a content item.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await prisma.contentItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
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
