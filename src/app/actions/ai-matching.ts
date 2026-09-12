"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { matchCreators } from "@/lib/ai-matching";
import { brandPaysCents } from "@/lib/pricing";
import type { MarketplaceCreator } from "@/components/brand/marketplace-creator-card";

export type MatchPickResult = {
  creator: MarketplaceCreator;
  reason: string;
  campaigns: { id: string; name: string }[];
  alreadyLinked: boolean;
};

export type MatchState = {
  error?: string;
  query?: string;
  picks?: MatchPickResult[];
} | null;

export async function matchCreatorsAction(
  _prev: MatchState,
  formData: FormData,
): Promise<MatchState> {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const query = String(formData.get("query") ?? "").trim();
  if (!query) return { error: "Type what you're looking for first." };

  const brand = await prisma.brand.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      valueProposition: true,
      icps: { orderBy: { rank: "asc" }, select: { title: true, description: true } },
    },
  });
  if (!brand) return { error: "Brand not found.", query };

  const [campaign, activeCampaigns, candidates, existingCollabs] = await Promise.all([
    prisma.campaign.findFirst({
      where: { brandId: brand.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { briefProduct: true, briefAudience: true },
    }),
    prisma.campaign.findMany({
      where: { brandId: brand.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.creatorProfile.findMany({
      where: { onboardingCompleted: true },
      take: 60,
      include: {
        user: { select: { firstName: true, lastName: true } },
        industries: { select: { label: true } },
      },
    }),
    prisma.collaboration.findMany({
      where: { campaign: { brandId: brand.id, status: "ACTIVE" } },
      select: { creatorId: true, campaignId: true },
    }),
  ]);

  const result = await matchCreators({
    query,
    brandName: brand.name ?? "Your brand",
    valueProposition: brand.valueProposition,
    icps: brand.icps,
    campaignBrief: campaign
      ? { product: campaign.briefProduct, audience: campaign.briefAudience }
      : null,
    candidates: candidates.map((c) => ({
      id: c.id,
      name: `${c.user.firstName} ${c.user.lastName}`,
      headline: c.headline,
      industries: c.industries.map((i) => i.label),
      country: c.country,
      pricePerPostCents: c.pricePerPostCents,
    })),
  });

  if ("error" in result) return { error: result.error, query };

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const linkedCampaignIdsByCreator = new Map<string, Set<string>>();
  for (const collab of existingCollabs) {
    const set = linkedCampaignIdsByCreator.get(collab.creatorId) ?? new Set<string>();
    set.add(collab.campaignId);
    linkedCampaignIdsByCreator.set(collab.creatorId, set);
  }

  const picks = result.picks
    .map((p): MatchPickResult | null => {
      const c = byId.get(p.creatorId);
      if (!c) return null;
      const creator: MarketplaceCreator = {
        id: c.id,
        name: `${c.user.firstName} ${c.user.lastName}`,
        headline: c.headline,
        industries: c.industries.map((i) => i.label),
        countryCode: c.country,
        brandPaysCents: brandPaysCents(c.pricePerPostCents),
        avatarUrl: c.avatarUrl,
      };
      const linked = linkedCampaignIdsByCreator.get(c.id) ?? new Set<string>();
      const campaigns = activeCampaigns.filter((camp) => !linked.has(camp.id));
      return {
        creator,
        reason: p.reason,
        campaigns,
        alreadyLinked: activeCampaigns.length > 0 && campaigns.length === 0,
      };
    })
    .filter((p): p is MatchPickResult => p !== null);

  return { picks, query };
}
