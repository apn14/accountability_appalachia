import { NextResponse } from "next/server";

import { getRegionDetail } from "@/lib/data";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const region = await getRegionDetail(slug);

  if (!region) {
    return NextResponse.json({ error: "Region not found" }, { status: 404 });
  }

  return NextResponse.json(region);
}

