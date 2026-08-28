import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect direct access to PDF documents.
 * Redirects /documents/*.pdf requests to the secure API route.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Block direct access to PDF files in /documents/
  if (pathname.startsWith("/documents/") && pathname.endsWith(".pdf")) {
    // Extract the document name to determine the API id
    const fileName = pathname.split("/").pop() || "";
    const docIdMap: Record<string, string> = {
      "constitution.pdf": "constitution",
      "finance-admin-policy.pdf": "finance-admin-policy",
      "policy-economic-freedom.pdf": "policy-economic-freedom",
      "policy-quality-education.pdf": "policy-quality-education",
      "policy-healthcare-for-all.pdf": "policy-healthcare-for-all",
      "policy-land-reform.pdf": "policy-land-reform",
      "policy-environmental-justice.pdf": "policy-environmental-justice",
      "policy-safety-security.pdf": "policy-safety-security",
    };

    const docId = docIdMap[fileName];
    if (docId) {
      // Redirect to the secure API route
      const url = req.nextUrl.clone();
      url.pathname = "/api/documents";
      url.searchParams.set("id", docId);
      return NextResponse.redirect(url);
    }

    // Unknown PDF — block entirely
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*"],
};
