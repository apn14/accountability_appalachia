import { NextResponse } from "next/server";

import { getQuestionStatusSummary } from "@/lib/data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const question = await getQuestionStatusSummary(id);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question);
}
