import { NextResponse } from "next/server";
import { QuestionStatus, VisibilityScope } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  submittedName: z.string().min(2).max(80),
  submittedEmail: z.string().email(),
  topicLabel: z.string().max(80).optional(),
  questionText: z.string().min(12).max(1000),
  representativeSlug: z.string().optional(),
  eventSlug: z.string().optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question payload" }, { status: 400 });
  }

  const event = parsed.data.eventSlug
    ? await prisma.event.findUnique({
        where: { slug: parsed.data.eventSlug },
        select: { id: true, regionId: true }
      })
    : null;

  const representative = parsed.data.representativeSlug
    ? await prisma.representative.findUnique({
        where: { slug: parsed.data.representativeSlug },
        include: {
          representativeTerms: {
            where: { isCurrent: true },
            include: { district: true },
            take: 1
          }
        }
      })
    : null;

  const regionId = event?.regionId ?? representative?.representativeTerms[0]?.district?.regionId;

  if (!regionId) {
    return NextResponse.json({ error: "Representative or event context is required" }, { status: 400 });
  }

  const question = await prisma.constituentQuestion.create({
    data: {
      regionId,
      eventId: event?.id,
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
