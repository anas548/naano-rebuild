"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type BillingState = { error?: string } | null;

function reference() {
  return `TOPUP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

/** Demo money: top-ups are instant and always succeed, on purpose — see
 *  SCOPE.md. There's no payment processor behind this. */
export async function topUpAction(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const euros = Number(formData.get("amount"));
  if (!Number.isFinite(euros) || euros <= 0) {
    return { error: "Enter an amount above zero." };
  }
  const amountCents = Math.round(euros * 100);

  const brand = await prisma.brand.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!brand) return { error: "Brand not found." };

  await prisma.$transaction([
    prisma.brand.update({
      where: { id: brand.id },
      data: { balanceCents: { increment: amountCents } },
    }),
    prisma.invoice.create({
      data: {
        brandId: brand.id,
        reference: reference(),
        type: "TOP_UP",
        amountCents,
        status: "PAID",
      },
    }),
  ]);

  revalidatePath("/brand/billing");
  revalidatePath("/brand");
  revalidatePath("/brand/collaborations");
  return null;
}
