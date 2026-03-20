import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { VisibilityScope } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  respondentEmail: z.string().email().optional(),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.string().min(1).max(500)
    })
  )
});

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid survey response payload" }, { status: 400 });
  }

  const survey = await prisma.survey.findUnique({
    where: { slug },
    select: { id: true, regionId: true }
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const surveyResponse = await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      regionId: survey.regionId,
      consentedAt: new Date(),
      visibilityScope: VisibilityScope.RESTRICTED,
      respondentHash: parsed.data.respondentEmail
        ? crypto.createHash("sha256").update(parsed.data.respondentEmail).digest("hex")
        : null
    }
  });

  await prisma.surveyAnswer.createMany({
    data: parsed.data.answers.map((answer) => ({
      surveyResponseId: surveyResponse.id,
      surveyQuestionId: answer.questionId,
      answerText: answer.value
    }))
  });

  return NextResponse.json({ ok: true, id: surveyResponse.id }, { status: 201 });
}

