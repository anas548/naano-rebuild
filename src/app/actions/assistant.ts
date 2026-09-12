"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { askBasicAssistant, rankOpportunitiesForCreator } from "@/lib/assistant";
import type { OpportunityPick } from "@/lib/assistant";

export type AssistantState = {
  error?: string;
  query?: string;
  answer?: string;
  /** Only set on /creator/opportunities - the page reads this to highlight
   *  and reorder the matching campaign cards. */
  ranking?: OpportunityPick[];
} | null;

export async function askAssistantAction(
  _prev: AssistantState,
  formData: FormData,
): Promise<AssistantState> {
  const user = await requireUser();
  const query = String(formData.get("query") ?? "").trim();
  const pathname = String(formData.get("pathname") ?? "");
  if (!query) return { error: "Type a question first." };

  // On the creator's Opportunities page specifically, every question is
  // treated as being about which opportunity fits them best - that's the
  // one purpose-built behavior; everywhere else is the basic chatbot.
  if (user.role === "CREATOR" && pathname === "/creator/opportunities") {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: user.id },
      include: { industries: { select: { label: true } } },
    });

    const campaigns = await prisma.campaign.findMany({
      where: { openToApplications: true, status: "ACTIVE" },
      include: { brand: { select: { name: true } } },
    });

    const result = await rankOpportunitiesForCreator({
      query,
      creatorHeadline: profile?.headline ?? null,
      creatorIndustries: profile?.industries.map((i) => i.label) ?? [],
      creatorCountry: profile?.country ?? null,
      creatorPricePerPostCents: profile?.pricePerPostCents ?? null,
      campaigns: campaigns.map((c) => ({
        campaignId: c.id,
        campaignName: c.name,
        brandName: c.brand.name ?? "Brand",
        briefProduct: c.briefProduct,
        briefAudience: c.briefAudience,
      })),
    });

    if ("error" in result) return { error: result.error, query };
    return { answer: result.summary, ranking: result.picks, query };
  }

  const result = await askBasicAssistant({
    query,
    userName: user.firstName,
    role: user.role,
  });
  if ("error" in result) return { error: result.error, query };
  return { answer: result.answer, query };
}
