import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/** Every onboarding step needs the same brand row plus its current ICPs. */
export async function getBrandOnboardingContext() {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const brand = await prisma.brand.findUnique({
    where: { userId: user.id },
    include: { icps: { orderBy: { rank: "asc" } } },
  });
  if (!brand) redirect("/signup/brand");

  return { user, brand };
}

/** Where an in-progress brand should land — used both to resume onboarding
 *  and to keep the dashboard unreachable until it's done. */
export function nextOnboardingStep(brand: {
  websiteUrl: string | null;
  onboardingCompleted: boolean;
  icps: unknown[];
}): string | null {
  if (brand.onboardingCompleted) return null;
  if (!brand.websiteUrl) return "/signup/brand/website";
  if (brand.icps.length === 0) return "/signup/brand/icp";
  return "/signup/brand/matching";
}
