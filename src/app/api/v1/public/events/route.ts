import { NextResponse } from "next/server";

import { getEvents } from "@/lib/data";

export async function GET() {
  const events = await getEvents();
  return NextResponse.json({ results: events, count: events.length });
}
