"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { inviteCreatorAction } from "@/app/actions/marketplace";
import { countryFlag } from "@/lib/countries";
import { formatEuros } from "@/lib/pricing";

export type MarketplaceCreator = {
  id: string;
  name: string;
  headline: string | null;
  industries: string[];
  countryCode: string | null;
  brandPaysCents: number;
};

export function MarketplaceCreatorCard({
  creator,
  campaigns,
  alreadyLinked,
}: {
  creator: MarketplaceCreator;
  campaigns: { id: string; name: string }[];
  /** True if this creator already has a collaboration on every one of the
   *  brand's active campaigns — nothing left to invite them to. */
  alreadyLinked: boolean;
}) {
  const [state, formAction, pending] = useActionState(inviteCreatorAction, null);

  const noCampaigns = campaigns.length === 0;
  const done = state?.invited || alreadyLinked;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e6e8ef] bg-white">
      <div className="sky-fade relative h-16">
        {creator.countryCode && (
          <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg bg-white/90 text-base shadow-sm">
            {countryFlag(creator.countryCode)}
          </span>
        )}
      </div>

      <div className="relative -mt-8 px-5">
        <div className="flex size-14 items-center justify-center rounded-full bg-[#dd005c] ring-4 ring-white">
          <span className="font-display text-[1.25rem] font-semibold text-white">
            {creator.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <h3 className="font-display text-[1.0625rem] font-semibold text-ink">
          {creator.name}
        </h3>
        {creator.industries.length > 0 && (
          <p className="mt-0.5 text-[0.8125rem] text-ink/50">
            {creator.industries.join(" · ")}
          </p>
        )}
        {creator.headline && (
          <p className="mt-2 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-ink/55">
            {creator.headline}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
          <div>
            <p className="text-[0.6875rem] text-ink/45">from</p>
            <p className="font-display text-[1.0625rem] font-semibold text-ink">
              {formatEuros(creator.brandPaysCents)}
              <span className="text-[0.75rem] font-normal text-ink/45"> /post</span>
            </p>
          </div>

          {done ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2faef] px-4 py-2 text-[0.8125rem] font-semibold text-[#00834a]">
              <Check className="size-4" />
              Invited
            </span>
          ) : noCampaigns ? (
            <span title="Create a campaign first" className="text-[0.75rem] text-ink/40">
              No open campaign
            </span>
          ) : (
            <form action={formAction} className="flex items-center gap-2">
              <input type="hidden" name="creatorId" value={creator.id} />
              {campaigns.length > 1 ? (
                <select
                  name="campaignId"
                  className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-[0.75rem] text-ink outline-none focus:border-naano-blue"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="hidden" name="campaignId" value={campaigns[0].id} />
              )}
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-naano-violet px-4 py-2 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add"}
              </button>
            </form>
          )}
        </div>
        {state?.error && (
          <p className="mt-2 text-right text-[0.75rem] text-red-600">{state.error}</p>
        )}
      </div>
    </div>
  );
}
