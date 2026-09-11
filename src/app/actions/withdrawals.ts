"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCreatorEarnings } from "@/lib/earnings";
import { formatEuros } from "@/lib/pricing";

export type WithdrawState = { error?: string; success?: boolean } | null;

/** Demo money, same as Billing's top-up: no real payment processor, and a
 *  Stripe withdrawal resolves instantly to PAID (matching the "Instant
 *  transfer" copy). Bank transfer stays an inert stub — see SCOPE.md. */
export async function withdrawAction(
  _prev: WithdrawState,
  formData: FormData,
): Promise<WithdrawState> {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  const euros = Number(formData.get("amount"));
  if (!Number.isFinite(euros) || euros <= 0) {
    return { error: "Enter an amount above zero." };
  }
  const amountCents = Math.round(euros * 100);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Creator profile not found." };

  const { available } = await getCreatorEarnings(user.id);
  if (amountCents > available) {
    return { error: `You can withdraw up to ${formatEuros(available)}.` };
  }

  // "Connecting" Stripe is implicit here — selecting it as the payout
  // method the first time a withdrawal is made is enough for a demo.
  const payoutMethod = await prisma.payoutMethod.upsert({
    where: { creatorId_type: { creatorId: profile.id, type: "STRIPE" } },
    update: { isSelected: true, stripeConnected: true },
    create: {
      creatorId: profile.id,
      type: "STRIPE",
      isSelected: true,
      stripeConnected: true,
    },
  });

  await prisma.withdrawal.create({
    data: {
      creatorId: profile.id,
      payoutMethodId: payoutMethod.id,
      amountCents,
      status: "PAID",
    },
  });

  revalidatePath("/creator/earnings");
  return { success: true };
}
