"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { cardSlug, validateSignIn, validateSignUp } from "@/lib/validation";
import type { FormErrors } from "@/lib/validation";
import { HeardAboutUs, UserRole } from "@/generated/prisma/enums";

// React 19 resets the form after an action resolves, so failed submissions have
// to hand back what was typed or the user loses it. Passwords are never echoed.
export type AuthState = {
  errors: FormErrors;
  values?: { firstName?: string; lastName?: string; email?: string };
} | null;

const HOME_FOR: Record<UserRole, string> = {
  BRAND: "/brand",
  CREATOR: "/creator",
};

function readHeardAboutUs(value: FormDataEntryValue | null) {
  const key = String(value ?? "");
  return key in HeardAboutUs ? (key as HeardAboutUs) : null;
}

export async function signUpAction(
  role: UserRole,
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const values = { firstName, lastName, email };

  const errors = validateSignUp({ firstName, lastName, email, password });
  if (Object.keys(errors).length > 0) return { errors, values };

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return {
      errors: { email: "An account with this email already exists." },
      values,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      role,
      passwordHash,
      ...(role === UserRole.BRAND
        ? {
            brand: {
              create: { heardAboutUs: readHeardAboutUs(formData.get("heardAboutUs")) },
            },
          }
        : {
            creator: { create: { cardSlug: cardSlug(firstName, lastName) } },
          }),
    },
    select: { id: true, role: true },
  });

  await createSession(user.id);
  redirect(HOME_FOR[user.role]);
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const errors = validateSignIn({ email, password });
  if (Object.keys(errors).length > 0) return { errors, values: { email } };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, passwordHash: true },
  });

  // Same message either way, so this can't be used to enumerate accounts.
  const invalid = {
    errors: { form: "That email or password is not right." },
    values: { email },
  };
  if (!user?.passwordHash) return invalid;
  if (!(await bcrypt.compare(password, user.passwordHash))) return invalid;

  await createSession(user.id);
  redirect(HOME_FOR[user.role]);
}

export async function signOutAction() {
  await destroySession();
  redirect("/signin");
}
