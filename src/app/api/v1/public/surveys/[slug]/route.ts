import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" }
      }
    }
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json(survey);
}

