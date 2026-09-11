import { CreatorCard, type CreatorCardData } from "@/components/creator/creator-card";

/** Right-hand panel for the creator signup steps. The card fills in as the
 *  creator answers each step. */
export function OnboardingPanel({ card }: { card: CreatorCardData }) {
  return (
    <div>
      <div className="text-center">
        <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-naano-blue uppercase">
          Your marketplace card
        </p>
        <h2 className="mt-3 font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
          Build a card brands can trust.
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
          It updates live with your profile, analytics, positioning and price.
        </p>
      </div>
      <div className="mt-8">
        <CreatorCard tone="blue" data={card} />
      </div>
    </div>
  );
}
