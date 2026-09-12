import "server-only";
import { callChatModel } from "@/lib/llm";

export type MatchCandidate = {
  id: string;
  name: string;
  headline: string | null;
  industries: string[];
  country: string | null;
  pricePerPostCents: number;
};

export type MatchPick = { creatorId: string; reason: string };

const SYSTEM_PROMPT = `You are Naano's creator-matching assistant. Naano is a B2B marketplace connecting LinkedIn creators with B2B SaaS brands for sponsored posts.
Given a brand's profile and a numbered list of real, available creators, pick up to 4 creators from that exact list who best fit the brand's request.
Rules:
- Only use creator ids that appear in the provided list. Never invent an id.
- Ground every reason in facts actually given for that creator (their industries, headline, price, country) - never invent facts, numbers, or claims not present in the input.
- Each reason is one sentence, specific to that creator, written for the brand reading it.
- If nothing in the list is a good fit, return fewer picks rather than forcing 4.
- Respond with ONLY valid JSON, no other text, in exactly this shape:
{"picks": [{"creatorId": "...", "reason": "one sentence"}]}`;

/**
 * Sends the brand's real profile plus the real Marketplace creator pool to
 * DeepSeek and asks for a ranked, reasoned shortlist. This is the one part
 * of AI Matching that is genuinely real — see SCOPE.md. Any failure (no
 * API key, network, rate limit, malformed output) returns a clear error
 * rather than fabricating a result.
 *
 * DeepSeek's JSON mode isn't schema-enforced (see src/lib/llm.ts): the shape
 * is spelled out in the prompt, and every returned creatorId is checked
 * against the real candidate list before being trusted — a hallucinated id
 * can't slip through even if the model ignored the instructions.
 */
export async function matchCreators(params: {
  query: string;
  brandName: string;
  valueProposition: string | null;
  icps: { title: string; description: string }[];
  campaignBrief: { product: string | null; audience: string | null } | null;
  candidates: MatchCandidate[];
}): Promise<{ picks: MatchPick[] } | { error: string }> {
  if (params.candidates.length === 0) {
    return { error: "No creators are listed on the Marketplace yet." };
  }

  const candidateList = params.candidates
    .map(
      (c) =>
        `- id:${c.id} | name:${c.name} | price:€${Math.round(c.pricePerPostCents / 100)}/post | country:${c.country ?? "unknown"} | industries:${c.industries.join(", ") || "none listed"} | headline:"${c.headline ?? ""}"`,
    )
    .join("\n");

  const icpList = params.icps.length
    ? params.icps.map((i) => `- ${i.title}: ${i.description}`).join("\n")
    : "none on file";

  const userMessage = `Brand: ${params.brandName}
Value proposition: ${params.valueProposition ?? "not provided"}
Ideal customer profiles:
${icpList}
Current campaign brief: ${params.campaignBrief?.product ?? "no active campaign"}
Campaign audience: ${params.campaignBrief?.audience ?? "n/a"}

Brand's request: "${params.query}"

Available creators:
${candidateList}

Pick up to 4 creators from the list above who best fit the brand's request and ICPs.`;

  const result = await callChatModel({ system: SYSTEM_PROMPT, user: userMessage, wantJson: true });
  if ("error" in result) return result;

  try {
    const parsed = JSON.parse(result.content) as { picks?: MatchPick[] };
    const validIds = new Set(params.candidates.map((c) => c.id));
    const picks = (parsed.picks ?? []).filter((p) => validIds.has(p?.creatorId)).slice(0, 4);

    if (picks.length === 0) {
      return { error: "No good matches came back for that — try rephrasing or widening the request." };
    }
    return { picks };
  } catch {
    return { error: "The assistant's response couldn't be read — try again." };
  }
}
