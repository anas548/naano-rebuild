"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { brandPaysCents } from "@/lib/pricing";

export type InviteState = { error?: string; invited?: boolean } | null;

export async function inviteCreatorAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const campaignId = String(formData.get("campaignId") ?? "");
  const creatorId = String(formData.get("creatorId") ?? "");
  if (!campaignId) return { error: "Create a campaign first." };
  if (!creatorId) return { error: "Missing creator." };

  // Inviting doesn't commit any money yet — that happens when the brand
  // accepts, which is where the wallet gate lives (Collaborations, next).
  const brand = await prisma.brand.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!brand) return { error: "Brand not found." };

  // Only the inviting brand's own active campaigns are valid targets.
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId: brand.id, status: "ACTIVE" },
    select: { id: true },
  });
  if (!campaign) return { error: "That campaign isn't open right now." };

  const creator = await prisma.creatorProfile.findFirst({
    where: { id: creatorId, onboardingCompleted: true },
    select: { id: true, pricePerPostCents: true },
  });
  if (!creator || !creator.pricePerPostCents) {
    return { error: "This creator isn't listed right now." };
  }

  const creatorNetCents = creator.pricePerPostCents;
  const amountCents = brandPaysCents(creatorNetCents);

  try {
    await prisma.collaboration.create({
      data: {
        campaignId,
        creatorId: creator.id,
        status: "INVITED",
        creatorNetCents,
        amountCents,
        nextAction: "Waiting for the creator to respond",
      },
    });
  } catch {
    // Unique on (campaignId, creatorId) — already invited/applied to this one.
    return { error: "Already invited to that campaign." };
  }

  revalidatePath("/brand/creators");
  revalidatePath("/brand/campaigns");
  revalidatePath(`/brand/campaigns/${campaignId}`);
  return { invited: true };
}
