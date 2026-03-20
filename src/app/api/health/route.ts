import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "accountability-appalachia",
    checkedAt: new Date().toISOString()
  });
}
