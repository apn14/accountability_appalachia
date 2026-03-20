import { NextResponse } from "next/server";

import { getMethodologyCards } from "@/lib/data";

export async function GET() {
  const methodologyCards = await getMethodologyCards();
  return NextResponse.json({ results: methodologyCards, count: methodologyCards.length });
}
