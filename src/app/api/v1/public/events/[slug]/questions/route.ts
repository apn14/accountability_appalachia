import { NextResponse } from "next/server";
import { QuestionStatus, VisibilityScope } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  submittedName: z.string().min(2).max(80),
  submittedEmail: z.string().email(),
  topicLabel: z.string().max(80).optional(),
  questionText: z.string().min(12).max(1000),
  representativeSlug: z.string().optional()
});

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question payload" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, regionId: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const representative = parsed.data.representativeSlug
    ? await prisma.representative.findUnique({
        where: { slug: parsed.data.representativeSlug },
        select: { id: true }
      })
    : null;

  const question = await prisma.constituentQuestion.create({
    data: {
      regionId: event.regionId,
      eventId: event.id,
      representativeId: representative?.id,
      submittedName: parsed.data.submittedName,
      submittedEmail: parsed.data.submittedEmail,
      topicLabel: parsed.data.topicLabel,
      questionText: parsed.data.questionText,
      publicVisibility: VisibilityScope.PUBLIC,
      responseStatus: QuestionStatus.PENDING
    }
  });

  return NextResponse.json({ ok: true, id: question.id }, { status: 201 });
}

