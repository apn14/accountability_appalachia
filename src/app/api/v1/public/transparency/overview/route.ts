import { NextResponse } from "next/server";

import { getTransparencyOverview } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getTransparencyOverview());
}

