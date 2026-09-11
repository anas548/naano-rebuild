"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type StepState = { error?: string } | null;

async function creatorUserId() {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");
  return user.id;
}

export async function saveLinkedInAction(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const userId = await creatorUserId();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();

  if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[^/\s]+\/?$/i.test(linkedinUrl)) {
    return { error: "Enter a public profile URL like linkedin.com/in/you." };
  }

  // The import itself stays paused by agreement, so we keep the URL and move on.
  await prisma.creatorProfile.update({
    where: { userId },
    data: { linkedinUrl, linkedinImportStatus: "PAUSED" },
  });

  redirect("/signup/creator/profile");
}

export async function saveProfileStepAction(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const userId = await creatorUserId();
  const country = String(formData.get("country") ?? "").trim();
  const industryIds = formData.getAll("industryIds").map(String).filter(Boolean);

  if (!country || industryIds.length === 0) {
    return { error: "Select your country and at least one industry to continue." };
  }
  if (industryIds.length > 3) return { error: "Pick at most 3 industries." };

  await prisma.creatorProfile.update({
    where: { userId },
    data: { country, industries: { set: industryIds.map((id) => ({ id })) } },
  });

  redirect("/signup/creator/price");
}

export async function savePriceStepAction(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const userId = await creatorUserId();
  const priceEuros = Number(formData.get("pricePerPost"));

  if (!Number.isFinite(priceEuros) || priceEuros <= 0) {
    return { error: "Enter a price above zero." };
  }

  const profile = await prisma.creatorProfile.update({
    where: { userId },
    data: {
      pricePerPostCents: Math.round(priceEuros * 100),
      // Listable once there is both a price and at least one industry.
      onboardingCompleted: true,
    },
    include: { industries: { select: { id: true } } },
  });

  if (profile.industries.length === 0) {
    await prisma.creatorProfile.update({
      where: { userId },
      data: { onboardingCompleted: false },
    });
  }

  redirect("/signup/creator/professional");
}

export async function saveProfessionalAction(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const userId = await creatorUserId();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessRegistration = String(
    formData.get("businessRegistration") ?? "",
  ).trim();

  await prisma.creatorProfile.update({
    where: { userId },
    data: {
      businessName: businessName || null,
      businessRegistration: businessRegistration || null,
    },
  });

  redirect("/signup/creator/card");
}
