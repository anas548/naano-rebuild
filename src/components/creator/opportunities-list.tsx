"use client";

import { Sparkles, Store } from "lucide-react";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { ApplyButton } from "@/components/creator/apply-button";
import { useAssistantContext } from "@/components/assistant/assistant-context";

export type OpportunityCampaign = {
  id: string;
  name: string;
  brandName: string;
  briefProduct: string | null;
  briefAudience: string | null;
  committedBudgetCents: number;
  status?: string;
};

export function OpportunitiesList({
  campaigns,
  noPrice,
  pricePerPostCents,
}: {
  campaigns: OpportunityCampaign[];
  noPrice: boolean;
  pricePerPostCents: number | null;
}) {
  const { opportunityRanking } = useAssistantContext();

  const reasonById = new Map(opportunityRanking?.picks.map((p) => [p.campaignId, p.reason]) ?? []);
  const rankById = new Map(opportunityRanking?.picks.map((p, i) => [p.campaignId, i]) ?? []);

  const ordered = opportunityRanking
    ? [...campaigns].sort((a, b) => {
        const ra = rankById.has(a.id) ? rankById.get(a.id)! : Infinity;
        const rb = rankById.has(b.id) ? rankById.get(b.id)! : Infinity;
        return ra - rb;
      })
    : campaigns;

  if (campaigns.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-[#e6e8ef] bg-white px-6 py-16 text-center">
        <Store className="mx-auto size-6 text-ink/25" />
        <h2 className="mt-4 font-display text-[1.0625rem] font-semibold text-ink">
          No open campaigns right now
        </h2>
        <p className="mx-auto mt-1.5 max-w-[24rem] text-[0.875rem] text-ink/50">
          When a brand opens a campaign to applications, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {ordered.map((campaign) => {
        const reason = reasonById.get(campaign.id);

        return (
          <article
            key={campaign.id}
            className={
              reason
                ? "flex flex-col rounded-xl border-2 border-naano-violet bg-white p-6"
                : "flex flex-col rounded-xl border border-[#e6e8ef] bg-white p-6"
            }
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#ecf1ff] font-display text-[0.9375rem] font-semibold text-naano-violet">
                {campaign.brandName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-semibold text-ink">
                  {campaign.brandName}
                </p>
                <p className="text-[0.75rem] text-ink/45">
                  Budget committed {formatEuros(campaign.committedBudgetCents)}
                </p>
              </div>
              {reason && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#f6f3ff] px-2.5 py-1 text-[0.6875rem] font-semibold text-naano-violet">
                  <Sparkles className="size-3" />
                  Best fit
                </span>
              )}
            </div>

            <h2 className="mt-5 font-display text-[1.125rem] font-semibold text-ink">
              {campaign.name}
            </h2>
            <p className="mt-2 line-clamp-3 text-[0.875rem] leading-relaxed text-ink/55">
              {campaign.briefProduct}
            </p>

            {campaign.briefAudience && (
              <div className="mt-4 flex flex-wrap gap-2">
                {campaign.briefAudience.split(" · ").map((audience) => (
                  <span
                    key={audience}
                    className="rounded-full bg-neutral-50 px-3 py-1 text-[0.75rem] text-ink/60 ring-1 ring-black/5"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            )}

            {reason && (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-[#f6f3ff] px-2.5 py-2 text-[0.75rem] leading-relaxed text-naano-violet">
                <Sparkles className="mt-0.5 size-3 shrink-0" />
                {reason}
              </p>
            )}

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-neutral-100 pt-4">
              <div>
                <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
                  You would receive
                </p>
                <p className="mt-1 font-display text-[1.25rem] font-semibold text-ink">
                  {pricePerPostCents ? `${formatEuros(pricePerPostCents)} / post` : "Set your rate"}
                </p>
              </div>

              {campaign.status ? (
                <span className="rounded-full bg-[#e2faef] px-4 py-2 text-[0.8125rem] font-semibold text-[#00834a]">
                  {humanizeStatus(campaign.status)}
                </span>
              ) : (
                <ApplyButton
                  campaignId={campaign.id}
                  disabledReason={noPrice ? "Set your price per post first" : undefined}
                />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
