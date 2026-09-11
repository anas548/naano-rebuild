"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { brandPaysCents } from "@/lib/pricing";

export type ApplyState = { error?: string; applied?: boolean } | null;

export async function applyToCampaignAction(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await requireUser();
  if (user.role !== "CREATOR") return { error: "Only creators can apply." };

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) return { error: "Missing campaign." };

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, pricePerPostCents: true },
  });

  if (!profile) return { error: "Creator profile not found." };
  if (!profile.pricePerPostCents) {
    return { error: "Set your price per post on My card before applying." };
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, openToApplications: true, status: "ACTIVE" },
    select: { id: true },
  });
  if (!campaign) return { error: "That campaign is no longer open." };

  // The creator's rate is net; the brand is committed for that plus Naano's margin.
  const creatorNetCents = profile.pricePerPostCents;

  try {
    await prisma.collaboration.create({
      data: {
        campaignId,
        creatorId: profile.id,
        status: "APPLIED",
        creatorNetCents,
        amountCents: brandPaysCents(creatorNetCents),
        nextAction: "Waiting for the brand to review your application",
      },
    });
  } catch {
    // The campaign/creator pair is unique, so a double submit lands here.
    return { error: "You have already applied to this campaign." };
  }

  revalidatePath("/creator/opportunities");
  revalidatePath("/creator/collaborations");
  return { applied: true };
}
