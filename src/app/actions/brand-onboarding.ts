"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { analyzeWebsite, normalizeDomain } from "@/lib/website-analysis";

export type StepState = { error?: string } | null;

async function brandUserId() {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");
  return user.id;
}

/** Step 1: "read the site" (canned lookup), then write the draft value
 *  proposition and ICPs so step 2 has something to show and edit. */
export async function analyzeWebsiteAction(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const userId = await brandUserId();
  const website = String(formData.get("website") ?? "").trim();

  const domain = normalizeDomain(website);
  if (!domain) return { error: "Enter a valid website, like yourcompany.com." };

  const analysis = analyzeWebsite(website);
  if (!analysis) return { error: "Enter a valid website, like yourcompany.com." };

  await prisma.brand.update({
    where: { userId },
    data: {
      websiteUrl: `https://${domain}`,
      name: analysis.name,
      valueProposition: analysis.valueProposition,
      icps: {
        deleteMany: {},
        create: analysis.icps.map((icp, index) => ({
          rank: index + 1,
          title: icp.title,
          description: icp.description,
        })),
      },
    },
  });

  redirect("/signup/brand/icp");
}

/** Step 2: the brand reviews/edits the value prop and 3 ICPs, which also
 *  seeds the starter campaign every creator sees when invited. */
export async function saveIcpStepAction(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const userId = await brandUserId();

  const valueProposition = String(formData.get("valueProposition") ?? "").trim();
  const titles = formData.getAll("icpTitle").map((v) => String(v).trim());
  const descriptions = formData.getAll("icpDescription").map((v) => String(v).trim());

  if (!valueProposition) {
    return { error: "Describe what the company does before continuing." };
  }
  if (titles.length !== 3 || titles.some((t) => !t) || descriptions.some((d) => !d)) {
    return { error: "Fill in all 3 ideal customer profiles before continuing." };
  }

  const brand = await prisma.brand.update({
    where: { userId },
    data: {
      valueProposition,
      icps: {
        updateMany: titles.map((title, index) => ({
          where: { rank: index + 1 },
          data: { title, description: descriptions[index] },
        })),
      },
    },
    select: { id: true, name: true },
  });

  // The starter campaign is what creators see on Opportunities once invited.
  // There's no unique constraint to upsert on, so look it up by name first —
  // re-running this step (editing the ICPs) should update it, not duplicate it.
  const audience = titles.join(" · ");
  const campaignName = `${brand.name} creator brief`;
  const existingCampaign = await prisma.campaign.findFirst({
    where: { brandId: brand.id, name: campaignName },
    select: { id: true },
  });

  if (existingCampaign) {
    await prisma.campaign.update({
      where: { id: existingCampaign.id },
      data: { briefProduct: valueProposition, briefAudience: audience },
    });
  } else {
    await prisma.campaign.create({
      data: {
        brandId: brand.id,
        name: campaignName,
        status: "ACTIVE",
        openToApplications: true,
        briefProduct: valueProposition,
        briefAudience: audience,
      },
    });
  }

  redirect("/signup/brand/matching");
}

/** Step 3: static "AI Matching" loading beat, then straight to the dashboard —
 *  no real matching behind it, per scope. */
export async function completeBrandOnboardingAction() {
  const userId = await brandUserId();

  await prisma.brand.update({
    where: { userId },
    data: { onboardingCompleted: true },
  });

  redirect("/brand");
}
