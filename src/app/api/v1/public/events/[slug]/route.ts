import { NextResponse } from "next/server";

import { getEventDetail } from "@/lib/data";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const event = await getEventDetail(slug);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

