/** Creators list a NET price per post; Naano adds its margin on top, so the
 *  brand pays more than the creator receives. Each collaboration stores both
 *  figures, so changing this rate never rewrites historical deals. */
export const NAANO_MARKUP_RATE = 0.2;

export function brandPaysCents(creatorNetCents: number) {
  return Math.round(creatorNetCents * (1 + NAANO_MARKUP_RATE));
}

export function naanoCutCents(creatorNetCents: number) {
  return brandPaysCents(creatorNetCents) - creatorNetCents;
}

export function formatEuros(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
