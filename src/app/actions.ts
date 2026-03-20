"use server";

import crypto from "node:crypto";

import { ModerationStatus, QuestionStatus, ReviewStatus, RSVPStatus, VisibilityScope } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearAdminSession,
  createAdminSession,
  getAdminActorId,
  requireAdminSession,
  validateAdminCredentials
} from "@/lib/auth";
import { runWvHouseRosterSync } from "@/lib/ingestion/wv-house-roster";
import { prisma } from "@/lib/prisma";

const honeypotSchema = z.object({
  website: z.string().optional()
});

const rsvpSchema = honeypotSchema.extend({
  eventSlug: z.string().min(1),
  guestName: z.string().min(2).max(80),
  guestEmail: z.string().email()
});

const questionSchema = honeypotSchema.extend({
  representativeSlug: z.string().optional(),
  eventSlug: z.string().optional(),
  submittedName: z.string().min(2).max(80),
  submittedEmail: z.string().email(),
  topicLabel: z.string().max(80).optional(),
  questionText: z.string().min(12).max(1000)
});

const surveySchema = honeypotSchema.extend({
  surveySlug: z.string().min(1),
  respondentEmail: z.string().email().optional().or(z.literal("")),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.string().min(1).max(500)
    })
  )
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function ensureNoSpam(honeypot: string | undefined) {
  if (honeypot) {
    redirect("/");
  }
}

export async function loginAdminAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  const isValid = await validateAdminCredentials(parsed.data.email, parsed.data.password);

  if (!isValid) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession(parsed.data.email);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function submitRsvpAction(formData: FormData) {
  const parsed = rsvpSchema.safeParse({
    website: formData.get("website"),
    eventSlug: formData.get("eventSlug"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail")
  });

  if (!parsed.success) {
    redirect("/events?status=invalid-rsvp");
  }

  ensureNoSpam(parsed.data.website);

  const event = await prisma.event.findUnique({
    where: { slug: parsed.data.eventSlug },
    select: { id: true, slug: true }
  });

  if (!event) {
    redirect("/events?status=missing-event");
  }

  await prisma.rSVP.create({
    data: {
      eventId: event.id,
      guestName: parsed.data.guestName,
      guestEmail: parsed.data.guestEmail,
      status: RSVPStatus.GOING
    }
  });

  revalidatePath(`/events/${event.slug}`);
  redirect(`/events/${event.slug}?status=rsvp-saved`);
}

export async function submitQuestionAction(formData: FormData) {
  const parsed = questionSchema.safeParse({
    website: formData.get("website"),
    representativeSlug: formData.get("representativeSlug") || undefined,
    eventSlug: formData.get("eventSlug") || undefined,
    submittedName: formData.get("submittedName"),
    submittedEmail: formData.get("submittedEmail"),
    topicLabel: formData.get("topicLabel") || undefined,
    questionText: formData.get("questionText")
  });

  if (!parsed.success) {
    redirect("/questions/new?status=invalid");
  }

  ensureNoSpam(parsed.data.website);

  const event = parsed.data.eventSlug
    ? await prisma.event.findUnique({
        where: { slug: parsed.data.eventSlug },
        select: { id: true, regionId: true, slug: true }
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
    redirect("/questions/new?status=missing-context");
  }

  await prisma.constituentQuestion.create({
    data: {
      regionId,
      eventId: event?.id,
      representativeId: representative?.id,
      submittedName: parsed.data.submittedName,
      submittedEmail: parsed.data.submittedEmail,
      topicLabel: parsed.data.topicLabel,
      questionText: parsed.data.questionText,
      moderationStatus: ModerationStatus.PENDING,
      publicVisibility: VisibilityScope.PUBLIC,
      responseStatus: QuestionStatus.PENDING
    }
  });

  if (event?.slug) {
    revalidatePath(`/events/${event.slug}`);
    redirect(`/events/${event.slug}?status=question-saved`);
  }

  redirect("/questions/new?status=question-saved");
}

export async function submitSurveyResponseAction(formData: FormData) {
  const answers = Array.from(formData.entries())
    .filter(([key, value]) => key.startsWith("question:") && typeof value === "string")
    .map(([key, value]) => ({
      questionId: key.replace("question:", ""),
      value
    }));

  const parsed = surveySchema.safeParse({
    website: formData.get("website"),
    surveySlug: formData.get("surveySlug"),
    respondentEmail: formData.get("respondentEmail") || "",
    answers
  });

  if (!parsed.success) {
    redirect("/surveys?status=invalid-response");
  }

  ensureNoSpam(parsed.data.website);

  const survey = await prisma.survey.findUnique({
    where: { slug: parsed.data.surveySlug },
    include: {
      questions: true
    }
  });

  if (!survey) {
    redirect("/surveys?status=missing-survey");
  }

  const response = await prisma.surveyResponse.create({
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

  for (const answer of parsed.data.answers) {
    await prisma.surveyAnswer.create({
      data: {
        surveyResponseId: response.id,
        surveyQuestionId: answer.questionId,
        answerText: answer.value
      }
    });
  }

  revalidatePath("/surveys");
  redirect("/surveys?status=response-saved");
}

export async function approveQuestionAction(formData: FormData) {
  await requireAdminSession();
  const questionId = String(formData.get("questionId") ?? "");
  const actorUserId = await getAdminActorId();

  await prisma.constituentQuestion.update({
    where: { id: questionId },
    data: { moderationStatus: ModerationStatus.APPROVED }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId,
      action: "question.approved",
      entityType: "ConstituentQuestion",
      entityId: questionId,
      reason: "Approved from admin review queue"
    }
  });

  revalidatePath("/admin/review");
}

export async function rejectQuestionAction(formData: FormData) {
  await requireAdminSession();
  const questionId = String(formData.get("questionId") ?? "");
  const actorUserId = await getAdminActorId();

  await prisma.constituentQuestion.update({
    where: { id: questionId },
    data: { moderationStatus: ModerationStatus.REJECTED }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId,
      action: "question.rejected",
      entityType: "ConstituentQuestion",
      entityId: questionId,
      reason: "Rejected from admin review queue"
    }
  });

  revalidatePath("/admin/review");
}

export async function resolveGapFlagAction(formData: FormData) {
  await requireAdminSession();
  const flagId = String(formData.get("flagId") ?? "");
  const actorUserId = await getAdminActorId();

  await prisma.dataGapFlag.update({
    where: { id: flagId },
    data: {
      reviewStatus: ReviewStatus.RESOLVED,
      resolvedAt: new Date(),
      resolutionNotes: "Resolved from admin review queue"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId,
      action: "data-gap.resolved",
      entityType: "DataGapFlag",
      entityId: flagId,
      reason: "Resolved from admin review queue"
    }
  });

  revalidatePath("/admin/review");
}

export async function dismissGapFlagAction(formData: FormData) {
  await requireAdminSession();
  const flagId = String(formData.get("flagId") ?? "");
  const actorUserId = await getAdminActorId();

  await prisma.dataGapFlag.update({
    where: { id: flagId },
    data: {
      reviewStatus: ReviewStatus.DISMISSED,
      resolvedAt: new Date(),
      resolutionNotes: "Dismissed from admin review queue"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId,
      action: "data-gap.dismissed",
      entityType: "DataGapFlag",
      entityId: flagId,
      reason: "Dismissed from admin review queue"
    }
  });

  revalidatePath("/admin/review");
}

export async function runWvHouseRosterSyncAction() {
  await requireAdminSession();
  await runWvHouseRosterSync();
  revalidatePath("/admin");
  revalidatePath("/admin/review");
  redirect("/admin?status=ingestion-complete");
}
