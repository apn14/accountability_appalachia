import { NextRequest, NextResponse } from "next/server";

import { getRepresentativeSearchResolution, searchRepresentatives } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") ?? "";
  const officeLevel = request.nextUrl.searchParams.get("officeLevel") ?? undefined;
  const results = await searchRepresentatives(query, officeLevel);
  const resolution = getRepresentativeSearchResolution(query);

  return NextResponse.json({ results, count: results.length, resolution });
}
