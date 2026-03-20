import { NextResponse } from "next/server";

import { getRepresentativeProfile } from "@/lib/data";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const representative = await getRepresentativeProfile(slug);

  if (!representative) {
    return NextResponse.json({ error: "Representative not found" }, { status: 404 });
  }

  return NextResponse.json(representative);
}
