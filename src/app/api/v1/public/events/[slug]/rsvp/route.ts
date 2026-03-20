import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  guestName: z.string().min(2).max(80),
  guestEmail: z.string().email()
});

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid RSVP payload" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const rsvp = await prisma.rSVP.create({
    data: {
      eventId: event.id,
      guestName: parsed.data.guestName,
      guestEmail: parsed.data.guestEmail
    }
  });

  return NextResponse.json({ ok: true, id: rsvp.id }, { status: 201 });
}

