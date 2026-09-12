import "server-only";
import { callChatModel } from "@/lib/llm";

const NAANO_DESCRIPTION = `Naano is a B2B LinkedIn creator marketplace demo. Brands describe their product and ideal customers, get matched with LinkedIn creators, invite them to campaigns at a price per post the creator sets, and the creator publishes a sponsored LinkedIn post. Money is demo-only: a brand tops up a wallet, accepting a deal debits it and books the creator, and once a brand approves a submitted post the creator's earnings become available to withdraw (also simulated). Naano takes a fixed percentage margin on every booking. LinkedIn's real data import (followers, posts, engagement) is intentionally paused in this build; only a creator's name and photo are pulled from their public profile.`;

/** The plain "what can I help you with" chatbot — basic info about how
 *  Naano works, honest about what's real vs demo in this build. Not
 *  personalized beyond the viewer's name and role, on purpose: it's meant
 *  to be a light FAQ assistant, not another data-grounded feature. */
export async function askBasicAssistant(params: {
  query: string;
  userName: string;
  role: "CREATOR" | "BRAND";
}): Promise<{ answer: string } | { error: string }> {
  const system = `You are NaanoBot, a short, friendly help assistant inside the Naano app. ${NAANO_DESCRIPTION}
You're talking to ${params.userName}, who is signed in as a ${params.role === "BRAND" ? "brand" : "creator"}.
Answer in 2-4 sentences, plain language, no markdown headers. If asked for a specific number from their account (balance, price, stats) that you don't actually have here, say you don't have that on hand rather than guessing, and suggest which page shows it. If asked something unrelated to Naano, briefly say so and redirect to what you can help with.`;

  const result = await callChatModel({ system, user: params.query });
  if ("error" in result) return result;
  return { answer: result.content };
}

export type OpportunityCandidate = {
  campaignId: string;
  campaignName: string;
  brandName: string;
  briefProduct: string | null;
  briefAudience: string | null;
};

export type OpportunityPick = { campaignId: string; reason: string };

/** Ranks a creator's real open Opportunities by fit against their real
 *  profile. There's no historical acceptance-rate data in this app, so the
 *  model is explicitly told never to state a probability or percentage —
 *  only a qualitative best-fit explanation grounded in the actual industries,
 *  headline, price and each campaign's actual brief.
 *
 *  DeepSeek's JSON mode isn't schema-enforced (see src/lib/llm.ts), so the
 *  exact shape is spelled out in the prompt and the parsed result is
 *  re-validated here: any campaignId not in the real candidate list is
 *  dropped, and a response that doesn't parse or comes back empty is a
 *  clear error, never a guess. */
export async function rankOpportunitiesForCreator(params: {
  query: string;
  creatorHeadline: string | null;
  creatorIndustries: string[];
  creatorCountry: string | null;
  creatorPricePerPostCents: number | null;
  campaigns: OpportunityCandidate[];
}): Promise<{ summary: string; picks: OpportunityPick[] } | { error: string }> {
  if (params.campaigns.length === 0) {
    return { error: "There are no open campaigns to rank right now." };
  }

  const system = `You are NaanoBot, helping a LinkedIn creator on Naano decide which OPEN campaign ("opportunity") best fits them and is most worth applying to.
There is no historical acceptance-rate data available - never state a percentage, probability, or "X% chance". Instead give a plain-language best-fit judgment based only on how well the campaign's stated brief/audience overlaps with the creator's own industries and headline.
Rules:
- Only use campaignId values from the list given below. Never invent one.
- Ground every reason in the actual brief/audience text and the creator's actual industries/headline - never invent facts.
- Pick up to 3 campaigns, ranked best first. If none are a clear fit, return fewer.
- Respond with ONLY valid JSON, no other text, in exactly this shape:
{"summary": "2-4 sentence plain-language answer naming the top pick by campaign name and briefly why", "picks": [{"campaignId": "...", "reason": "one sentence"}]}`;

  const campaignList = params.campaigns
    .map(
      (c) =>
        `- campaignId:${c.campaignId} | campaign:"${c.campaignName}" | brand:${c.brandName} | brief:"${c.briefProduct ?? ""}" | audience:"${c.briefAudience ?? ""}"`,
    )
    .join("\n");

  const user = `Creator profile:
Headline: ${params.creatorHeadline ?? "not set"}
Industries: ${params.creatorIndustries.join(", ") || "none listed"}
Country: ${params.creatorCountry ?? "not set"}
Price per post: ${params.creatorPricePerPostCents ? `€${Math.round(params.creatorPricePerPostCents / 100)}` : "not set"}

Creator's question: "${params.query}"

Open campaigns:
${campaignList}`;

  const result = await callChatModel({ system, user, wantJson: true });
  if ("error" in result) return result;

  try {
    const parsed = JSON.parse(result.content) as { summary?: string; picks?: OpportunityPick[] };
    const validIds = new Set(params.campaigns.map((c) => c.campaignId));
    const picks = (parsed.picks ?? []).filter((p) => validIds.has(p?.campaignId)).slice(0, 3);
    if (picks.length === 0 || !parsed.summary) {
      return { error: "No clear best fit came back — try rephrasing your question." };
    }
    return { summary: parsed.summary, picks };
  } catch {
    return { error: "The assistant's response couldn't be read — try again." };
  }
}
