import "server-only";

export type MatchCandidate = {
  id: string;
  name: string;
  headline: string | null;
  industries: string[];
  country: string | null;
  pricePerPostCents: number;
};

export type MatchPick = { creatorId: string; reason: string };

const SCHEMA = {
  type: "object",
  properties: {
    picks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          creatorId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["creatorId", "reason"],
        additionalProperties: false,
      },
      maxItems: 4,
    },
  },
  required: ["picks"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are Naano's creator-matching assistant. Naano is a B2B marketplace connecting LinkedIn creators with B2B SaaS brands for sponsored posts.
Given a brand's profile and a numbered list of real, available creators, pick up to 4 creators from that exact list who best fit the brand's request.
Rules:
- Only use creator ids that appear in the provided list. Never invent an id.
- Ground every reason in facts actually given for that creator (their industries, headline, price, country) - never invent facts, numbers, or claims not present in the input.
- Each reason is one sentence, specific to that creator, written for the brand reading it.
- If nothing in the list is a good fit, return fewer picks rather than forcing 4.`;

/**
 * Sends the brand's real profile plus the real Marketplace creator pool to
 * OpenAI and asks for a ranked, reasoned shortlist. This is the one part of
 * AI Matching that is genuinely real — see SCOPE.md. Any failure (no API
 * key, network, rate limit, malformed output) returns a clear error rather
 * than fabricating a result.
 */
export async function matchCreators(params: {
  query: string;
  brandName: string;
  valueProposition: string | null;
  icps: { title: string; description: string }[];
  campaignBrief: { product: string | null; audience: string | null } | null;
  candidates: MatchCandidate[];
}): Promise<{ picks: MatchPick[] } | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "AI matching isn't configured yet (no OPENAI_API_KEY)." };
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

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "creator_matches", schema: SCHEMA, strict: true },
        },
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return { error: `The matching model returned an error (HTTP ${res.status}). Try again in a moment.` };
    }

    const data = await res.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) return { error: "The matching model returned an empty response." };

    const parsed = JSON.parse(content) as { picks?: MatchPick[] };
    const validIds = new Set(params.candidates.map((c) => c.id));
    const picks = (parsed.picks ?? []).filter((p) => validIds.has(p.creatorId)).slice(0, 4);

    if (picks.length === 0) {
      return { error: "No good matches came back for that — try rephrasing or widening the request." };
    }
    return { picks };
  } catch {
    return { error: "Couldn't reach the matching model right now — try again in a moment." };
  }
}
