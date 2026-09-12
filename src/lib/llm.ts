import "server-only";

/**
 * Thin wrapper around DeepSeek's chat completions endpoint, shared by every
 * AI feature in this app (AI Matching, the assistant bar). DeepSeek's API is
 * OpenAI-compatible in shape but NOT in JSON-output guarantees: it only
 * supports response_format: {type: "json_object"} (loose JSON mode), not
 * OpenAI's schema-constrained, server-validated json_schema/strict mode.
 * There's no server-side guarantee the shape matches what was asked for, so
 * every caller that wants structured data must describe the exact JSON shape
 * in the prompt itself AND validate/filter the parsed result before trusting
 * it — see each caller for how it guards against a malformed or
 * partially-hallucinated response.
 *
 * Single-turn only: no conversation history is sent or kept anywhere. Every
 * call is one question in, one answer out.
 */
export async function callChatModel(params: {
  system: string;
  user: string;
  /** Requests DeepSeek's loose JSON mode. The word "json" must appear in
   *  system or user content for this to take effect — every caller that
   *  passes true already describes the JSON shape it wants in the prompt. */
  wantJson?: boolean;
}): Promise<{ content: string } | { error: string }> {
  const apiKey = process.env.DEEP_SEEK_API_KEY;
  if (!apiKey) return { error: "The assistant isn't configured yet (no DEEP_SEEK_API_KEY)." };

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEP_SEEK_MODEL ?? "deepseek-flash",
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
        temperature: 0.4,
        ...(params.wantJson ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return { error: `The assistant returned an error (HTTP ${res.status}). Try again in a moment.` };
    }

    const data = await res.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) return { error: "The assistant returned an empty response." };
    return { content };
  } catch {
    return { error: "Couldn't reach the assistant right now — try again in a moment." };
  }
}
