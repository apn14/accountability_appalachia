import { NextResponse } from "next/server";

import { getSurveys } from "@/lib/data";

export async function GET() {
  const surveys = await getSurveys();
  return NextResponse.json({ results: surveys, count: surveys.length });
}

