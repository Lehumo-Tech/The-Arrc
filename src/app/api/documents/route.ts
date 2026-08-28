import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Allowed documents registry (prevents arbitrary file access)
const ALLOWED_DOCUMENTS: Record<string, { file: string; supabaseUrl: string }> = {
  constitution: {
    file: "constitution.pdf",
    supabaseUrl:
      "https://uguyorpawowezxlfeaug.supabase.co/storage/v1/object/public/documents/constitution.pdf",
  },
  "arrc-2026-manifesto": {
    file: "arrc-2026-manifesto.pdf",
    supabaseUrl:
      "https://uguyorpawowezxlfeaug.supabase.co/storage/v1/object/public/documents/policies/arrc-2026-manifesto.pdf",
  },
  "finance-admin-policy": {
    file: "finance-admin-policy.pdf",
    supabaseUrl:
      "https://uguyorpawowezxlfeaug.supabase.co/storage/v1/object/public/documents/finance-admin-policy.pdf",
  },
  "draft-admin-policy": {
    file: "draft-admin-policy.pdf",
    supabaseUrl:
      "https://uguyorpawowezxlfeaug.supabase.co/storage/v1/object/public/documents/policies/draft-admin-policy.pdf",
  },
  "members-code": {
    file: "members-code.pdf",
    supabaseUrl:
      "https://uguyorpawowezxlfeaug.supabase.co/storage/v1/object/public/documents/policies/members-code.pdf",
  },
};

const DOCUMENTS_DIR = path.join(process.cwd(), "public", "documents");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("id");

  if (!docId || !ALLOWED_DOCUMENTS[docId]) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const doc = ALLOWED_DOCUMENTS[docId];

  // Try local filesystem first (for dev), then fallback to Supabase Storage (for production)
  try {
    const filePath = path.join(DOCUMENTS_DIR, doc.file);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${doc.file}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    // Local file not found — proxy from Supabase Storage (production)
    try {
      const supabaseRes = await fetch(doc.supabaseUrl);

      if (!supabaseRes.ok) {
        return NextResponse.json(
          { error: "Document file not found" },
          { status: 404 }
        );
      }

      const arrayBuffer = await supabaseRes.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${doc.file}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "X-Content-Type-Options": "nosniff",
          "Cross-Origin-Resource-Policy": "same-origin",
          "Accept-Ranges": "bytes",
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Document file not found" },
        { status: 404 }
      );
    }
  }
}
