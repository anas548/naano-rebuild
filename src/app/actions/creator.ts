"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type CardState = { error?: string; saved?: boolean } | null;

const MAX_INDUSTRIES = 3;

export async function updateCreatorCardAction(
  _prev: CardState,
  formData: FormData,
): Promise<CardState> {
  const user = await requireUser();
  if (user.role !== "CREATOR") return { error: "Only creators can edit a card." };

  const headline = String(formData.get("headline") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const industryIds = formData.getAll("industryIds").map(String).filter(Boolean);
  const priceEuros = Number(formData.get("pricePerPost"));

  if (industryIds.length > MAX_INDUSTRIES) {
    return { error: `Pick at most ${MAX_INDUSTRIES} industries.` };
  }
  if (!Number.isFinite(priceEuros) || priceEuros < 0) {
    return { error: "Enter a price of zero or more." };
  }

  const pricePerPostCents = Math.round(priceEuros * 100);

  // A card is only listable once brands can actually filter and book it.
  const complete = industryIds.length > 0 && pricePerPostCents > 0;

  await prisma.creatorProfile.update({
    where: { userId: user.id },
    data: {
      headline: headline || null,
      country: country || null,
      pricePerPostCents,
      onboardingCompleted: complete,
      industries: { set: industryIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/creator");
  revalidatePath("/creator/card");
  return { saved: true };
}
