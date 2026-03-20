import "server-only";

import crypto from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE_NAME = "aa_admin_session";

function getEnv(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD" | "SESSION_SECRET") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function encodeEmail(email: string) {
  return Buffer.from(email, "utf8").toString("base64url");
}

function decodeEmail(encoded: string) {
  return Buffer.from(encoded, "base64url").toString("utf8");
}

function signEmail(email: string) {
  return crypto.createHmac("sha256", getEnv("SESSION_SECRET")).update(email).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function validateAdminCredentials(email: string, password: string) {
  return safeEqual(email, getEnv("ADMIN_EMAIL")) && safeEqual(password, getEnv("ADMIN_PASSWORD"));
}

export async function createAdminSession(email: string) {
  const value = `${encodeEmail(email)}.${signEmail(email)}`;

  (await cookies()).set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession() {
  const raw = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const [encodedEmail, signature] = raw.split(".");

  if (!encodedEmail || !signature) {
    return null;
  }

  const email = decodeEmail(encodedEmail);
  const expected = signEmail(email);

  if (!safeEqual(signature, expected)) {
    return null;
  }

  return { email };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function getAdminActorId() {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true }
  });

  return user?.id ?? null;
}

