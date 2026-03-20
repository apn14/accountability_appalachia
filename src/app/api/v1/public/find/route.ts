import { NextRequest, NextResponse } from "next/server";

import { searchRepresentatives } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.toLowerCase() ?? "";
  const officeLevel = request.nextUrl.searchParams.get("officeLevel") ?? undefined;
  const results = await searchRepresentatives(query, officeLevel);

  return NextResponse.json({ results, count: results.length });
}
