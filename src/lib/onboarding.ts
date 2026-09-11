import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { CreatorCardData } from "@/components/creator/creator-card";

/** Every signup step needs the same profile plus a card built from it. */
export async function getOnboardingContext() {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    include: { industries: { select: { id: true, label: true } } },
  });
  if (!profile) redirect("/creator");

  const card: CreatorCardData = {
    name: `${user.firstName} ${user.lastName}`,
    headline: profile.headline,
    industries: profile.industries.map((i) => i.label),
    followerCount: profile.followerCount,
    estImpressions: null,
    pricePerPostCents: profile.pricePerPostCents || null,
    hasPostData: true,
    countryCode: profile.country,
  };

  return { user, profile, card };
}
