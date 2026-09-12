import "server-only";

export type ScrapedProfile = { name: string | null; avatarUrl: string | null };

const OG_TITLE = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i;
const OG_IMAGE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Best-effort identity enrichment from a public LinkedIn profile — no login,
 * no LinkedIn API, just the og:title/og:image meta tags LinkedIn renders for
 * link-preview crawlers (the same thing that makes a pasted profile link show
 * a name and photo in Slack or iMessage). LinkedIn's real profile HTML
 * requires a session, so this is deliberately limited to those two tags and
 * fails silently on anything else — a private profile, a redirect to a login
 * wall, a timeout, a changed markup — never blocks onboarding. The creator
 * simply keeps whatever they typed at signup.
 */
export async function scrapeLinkedInProfile(url: string): Promise<ScrapedProfile> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { name: null, avatarUrl: null };

    const html = await res.text();

    const titleMatch = html.match(OG_TITLE);
    const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : null;
    // LinkedIn's og:title is usually "First Last - Headline | LinkedIn" —
    // the name is everything before the first separator.
    const name = rawTitle ? rawTitle.split(/[|\-–]/)[0].trim() : null;

    const imageMatch = html.match(OG_IMAGE);
    const rawImage = imageMatch ? decodeHtmlEntities(imageMatch[1]) : null;
    const avatarUrl = rawImage && rawImage.startsWith("http") ? rawImage : null;

    return {
      name: name && name.length > 1 ? name : null,
      avatarUrl,
    };
  } catch {
    return { name: null, avatarUrl: null };
  }
}

/** Splits a scraped full name into (first, last) the same way the signup
 *  form's two fields would have been filled in. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? fullName;
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}
