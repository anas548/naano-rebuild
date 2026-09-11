import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const COOKIE = "naano_session";
const MAX_AGE = 60 * 60 * 24 * 30;

// Stub auth by agreement: the cookie holds the user id directly, with no
// signing or session table. Anyone who can set a cookie can impersonate a user,
// so this must be replaced before anything real ships.
export async function createSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const userId = store.get(COOKIE)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
});

/** Layouts and pages render in parallel, so a redirect in the layout does not
 *  stop the page body from running. Pages must guard for themselves. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}
