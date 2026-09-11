"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type CollabActionState = { error?: string } | null;

function reference(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

/** The one place a collaboration becomes ACTIVE, whichever side triggers it
 *  (a creator accepting an invite, or a brand accepting an application).
 *  This is where the wallet gate lives: the brand's balance is checked and
 *  debited here, not when the invite/application was created, so sending
 *  invites or applying never costs anything by itself. */
async function activateCollaboration(
  collaborationId: string,
  viewer: "creator" | "brand",
) {
  const collaboration = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    select: {
      id: true,
      amountCents: true,
      campaign: { select: { brandId: true, brand: { select: { balanceCents: true } } } },
    },
  });
  if (!collaboration) return { error: "Collaboration not found." };

  const { brandId, brand } = collaboration.campaign;
  if (brand.balanceCents < collaboration.amountCents) {
    return {
      error:
        viewer === "brand"
          ? "Your wallet doesn't have enough balance to activate this booking."
          : "The brand's wallet doesn't have enough balance to activate this booking yet — try again later.",
    };
  }

  await prisma.$transaction([
    prisma.brand.update({
      where: { id: brandId },
      data: { balanceCents: { decrement: collaboration.amountCents } },
    }),
    prisma.invoice.create({
      data: {
        brandId,
        reference: reference("BOOK"),
        type: "BOOKING",
        amountCents: collaboration.amountCents,
        status: "PAID",
      },
    }),
    prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        status: "ACTIVE",
        nextAction: "Waiting for the creator to publish their post",
      },
    }),
  ]);

  return null;
}

function revalidateBoth(campaignId?: string) {
  revalidatePath("/creator/collaborations");
  revalidatePath("/creator/earnings");
  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/campaigns");
  revalidatePath("/brand/billing");
  revalidatePath("/brand");
  if (campaignId) revalidatePath(`/brand/campaigns/${campaignId}`);
}

// --- Creator side: responding to a brand's invitation (status INVITED) -----

export async function acceptInvitationAction(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const collaboration = await prisma.collaboration.findFirst({
    where: { id: collaborationId, creator: { userId: user.id }, status: "INVITED" },
    select: { id: true, campaignId: true },
  });
  if (!collaboration) return { error: "This invitation is no longer available." };

  const result = await activateCollaboration(collaboration.id, "creator");
  if (result?.error) return result;

  revalidateBoth(collaboration.campaignId);
  return null;
}

export async function declineInvitationAction(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const collaboration = await prisma.collaboration.findFirst({
    where: { id: collaborationId, creator: { userId: user.id }, status: "INVITED" },
    select: { id: true, campaignId: true },
  });
  if (!collaboration) return { error: "This invitation is no longer available." };

  await prisma.collaboration.update({
    where: { id: collaboration.id },
    data: { status: "DECLINED", nextAction: null },
  });

  revalidateBoth(collaboration.campaignId);
  return null;
}

// --- Brand side: responding to a creator's application (status APPLIED) ---

export async function acceptApplicationAction(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const collaboration = await prisma.collaboration.findFirst({
    where: {
      id: collaborationId,
      status: "APPLIED",
      campaign: { brand: { userId: user.id } },
    },
    select: { id: true, campaignId: true },
  });
  if (!collaboration) return { error: "This application is no longer available." };

  const result = await activateCollaboration(collaboration.id, "brand");
  if (result?.error) return result;

  revalidateBoth(collaboration.campaignId);
  return null;
}

export async function declineApplicationAction(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const collaboration = await prisma.collaboration.findFirst({
    where: {
      id: collaborationId,
      status: "APPLIED",
      campaign: { brand: { userId: user.id } },
    },
    select: { id: true, campaignId: true },
  });
  if (!collaboration) return { error: "This application is no longer available." };

  await prisma.collaboration.update({
    where: { id: collaboration.id },
    data: { status: "DECLINED", nextAction: null },
  });

  revalidateBoth(collaboration.campaignId);
  return null;
}

// --- Creator side: submitting the published post (status ACTIVE) ----------

export async function submitPostAction(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();

  if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(linkedinUrl)) {
    return { error: "Enter the LinkedIn post URL." };
  }

  const collaboration = await prisma.collaboration.findFirst({
    where: { id: collaborationId, creator: { userId: user.id }, status: "ACTIVE" },
    select: { id: true, campaignId: true, posts: { select: { id: true, publishedAt: true } } },
  });
  if (!collaboration) return { error: "This collaboration isn't active." };

  const existing = collaboration.posts[0];
  if (existing) {
    await prisma.post.update({
      where: { id: existing.id },
      data: { linkedinUrl, publishedAt: existing.publishedAt ?? new Date() },
    });
  } else {
    await prisma.post.create({
      data: { collaborationId: collaboration.id, linkedinUrl, publishedAt: new Date() },
    });
  }

  await prisma.collaboration.update({
    where: { id: collaboration.id },
    data: { nextAction: "Waiting for the brand to approve your post" },
  });

  revalidateBoth(collaboration.campaignId);
  return null;
}

// --- Brand side: approving the submitted post (status ACTIVE -> COMPLETED) -

export async function approvePostAction(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const collaboration = await prisma.collaboration.findFirst({
    where: {
      id: collaborationId,
      status: "ACTIVE",
      campaign: { brand: { userId: user.id } },
    },
    select: {
      id: true,
      campaignId: true,
      posts: { select: { linkedinUrl: true } },
    },
  });
  if (!collaboration) return { error: "This collaboration isn't active." };
  if (!collaboration.posts[0]?.linkedinUrl) {
    return { error: "No post has been submitted yet." };
  }

  // No Earning row is created here on purpose: the Earnings page already
  // treats a COMPLETED collaboration with no Earning row as fully AVAILABLE.
  await prisma.collaboration.update({
    where: { id: collaboration.id },
    data: { status: "COMPLETED", nextAction: null },
  });

  revalidateBoth(collaboration.campaignId);
  return null;
}
