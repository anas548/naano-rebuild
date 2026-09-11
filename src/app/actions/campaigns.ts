"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type CampaignFormState = { error?: string } | null;

async function requireBrand() {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const brand = await prisma.brand.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!brand) redirect("/signup/brand");
  return brand;
}

function readFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const briefProduct = String(formData.get("briefProduct") ?? "").trim();
  const briefAudience = String(formData.get("briefAudience") ?? "").trim();
  const budgetEuros = String(formData.get("committedBudget") ?? "").trim();

  const errors: string[] = [];
  if (!name) errors.push("Give the campaign a name.");
  if (!briefProduct) errors.push("Describe what the creator is posting about.");

  const committedBudgetCents = budgetEuros
    ? Math.round(Number(budgetEuros) * 100)
    : 0;
  if (budgetEuros && (!Number.isFinite(committedBudgetCents) || committedBudgetCents < 0)) {
    errors.push("Enter a valid budget.");
  }

  return { name, briefProduct, briefAudience, committedBudgetCents, errors };
}

export async function createCampaignAction(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const brand = await requireBrand();
  const { name, briefProduct, briefAudience, committedBudgetCents, errors } =
    readFields(formData);
  if (errors.length > 0) return { error: errors.join(" ") };

  // "Save as draft" vs "Launch campaign" — the only two states a brand can
  // pick when creating one; COMPLETED is set later, not at creation.
  const launch = formData.get("intent") === "launch";

  const campaign = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      name,
      briefProduct,
      briefAudience: briefAudience || null,
      committedBudgetCents,
      status: launch ? "ACTIVE" : "DRAFT",
      openToApplications: launch,
    },
    select: { id: true },
  });

  revalidatePath("/brand/campaigns");
  redirect(`/brand/campaigns/${campaign.id}`);
}

export async function updateCampaignAction(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const brand = await requireBrand();
  const campaignId = String(formData.get("campaignId") ?? "");

  const existing = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId: brand.id },
    select: { id: true },
  });
  if (!existing) return { error: "Campaign not found." };

  const { name, briefProduct, briefAudience, committedBudgetCents, errors } =
    readFields(formData);
  if (errors.length > 0) return { error: errors.join(" ") };

  const status = String(formData.get("status") ?? "ACTIVE");
  const openToApplications = formData.get("openToApplications") === "on";

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name,
      briefProduct,
      briefAudience: briefAudience || null,
      committedBudgetCents,
      status: status === "DRAFT" || status === "COMPLETED" ? status : "ACTIVE",
      openToApplications,
    },
  });

  revalidatePath("/brand/campaigns");
  revalidatePath(`/brand/campaigns/${campaignId}`);
  revalidatePath("/creator/opportunities");
  return null;
}
