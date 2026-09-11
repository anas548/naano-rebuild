import { CreatorCard } from "@/components/creator/creator-card";

/** The card as it looks before any profile data exists, which is where the
 *  signup flow starts. */
export function MarketplaceCardPreview() {
  return (
    <CreatorCard
      tone="blue"
      className="mx-auto max-w-[495px]"
      data={{
        name: "Your name",
        headline: null,
        industries: [],
        followerCount: 0,
        estImpressions: null,
        pricePerPostCents: null,
        hasPostData: true,
      }}
    />
  );
}
