import { NextResponse } from "next/server";

import { runWvHouseRosterSync } from "@/lib/ingestion/wv-house-roster";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    throw new Error("CRON_SECRET is not configured.");
  }

  const header = request.headers.get("authorization");

  return header === `Bearer ${secret}`;
}

async function handle(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }

    const result = await runWvHouseRosterSync();
    return NextResponse.json(result);
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unknown ingestion error");
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

