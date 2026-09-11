"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  Link2,
  UserPlus,
  Wallet,
} from "lucide-react";
import { formatEuros } from "@/lib/pricing";
import { cn } from "@/lib/utils";

function CopyLink({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e6e8ef] bg-white px-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[0.875rem] font-medium text-naano-blue">
          {value.replace(/^https?:\/\//, "")}
        </span>
      </span>
      {copied ? (
        <Check className="size-4 shrink-0 text-[#00b14e]" />
      ) : (
        <Copy className="size-4 shrink-0 text-ink/40" />
      )}
    </button>
  );
}

export function AffiliatePanels({
  brandLink,
  creatorLink,
  cardPublished,
  rewardsEarnedCents,
  creatorsInvited,
  earningNow,
}: {
  brandLink: string;
  creatorLink: string;
  cardPublished: boolean;
  rewardsEarnedCents: number;
  creatorsInvited: number;
  earningNow: number;
}) {
  const [tab, setTab] = useState<"brands" | "creators">("brands");
  const [copied, setCopied] = useState(false);

  async function copyBrandLink() {
    try {
      await navigator.clipboard.writeText(brandLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mx-auto flex w-fit items-center rounded-full bg-[#f1efe9] p-1.5">
        {(
          [
            { id: "brands", label: "Invite brands", icon: Building2 },
            { id: "creators", label: "Invite creators", icon: UserPlus },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.875rem] font-semibold transition-colors",
              tab === id ? "bg-white text-ink shadow-sm" : "text-ink/55",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "brands" ? (
        <section className="mt-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.8125rem] font-semibold text-ink shadow-sm ring-1 ring-black/5">
            <span className="size-1.5 rounded-full bg-[#7cc3f5]" />
            Creator affiliation · 25% for 3 months
          </span>

          <h2 className="mx-auto mt-8 max-w-[22ch] font-display text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
            Recommend Naano. Earn for 3 months.
          </h2>
          <p className="mx-auto mt-5 max-w-[38rem] text-[0.9375rem] leading-relaxed text-ink/55">
            Share your personal link with a company. If it joins Naano and
            launches paid campaigns, you receive 25% of Naano&apos;s commission
            for three months.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <button
              type="button"
              onClick={copyBrandLink}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Link copied" : "Copy my referral link"}
            </button>
            <span className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink">
              See how it works
              <ArrowRight className="size-4" />
            </span>
          </div>

          <div className="mt-12 rounded-3xl border border-[#dbe7f7] bg-gradient-to-br from-[#f3f9ff] to-[#eef4ff] p-6 text-left sm:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <div className="rounded-2xl bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-ink">
                    <Building2 className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-ink">
                      Introduce a company to Naano
                    </p>
                    <p className="text-[0.8125rem] text-ink/50">
                      Your link identifies you automatically
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <CopyLink value={brandLink} label="Your personal referral link" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[0.75rem] font-semibold text-ink/45">
                <span className="hidden h-px w-8 bg-ink/15 lg:block" />
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#7cc3f5]" />
                  Tracked
                </span>
                <span className="hidden h-px w-8 bg-ink/15 lg:block" />
              </div>

              <div className="rounded-2xl bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
                      Your share of Naano&apos;s commission
                    </p>
                    <p className="mt-2 font-display text-[2rem] font-semibold text-ink">
                      25%
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf2ff]">
                    <Wallet className="size-5 text-naano-blue" />
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-[0.875rem] text-ink/55">Reward period</span>
                  <span className="text-[0.875rem] font-semibold text-ink">
                    3 months
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.8125rem] font-semibold text-ink shadow-sm ring-1 ring-black/5">
                <span className="size-1.5 rounded-full bg-[#7cc3f5]" />
                Creator referrals · 25% for 3 months
              </span>

              <h2 className="mt-7 font-display text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-ink sm:text-[3rem]">
                Invite great creators. Earn when they do.
              </h2>
              <p className="mt-5 max-w-[32rem] text-[0.9375rem] leading-relaxed text-ink/55">
                When a creator you invite completes their first paid
                collaboration, you earn 25% of Naano&apos;s commission on their
                collaborations for three months.
              </p>

              <button
                type="button"
                disabled={!cardPublished}
                onClick={async () => {
                  await navigator.clipboard.writeText(creatorLink);
                }}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-ink/40"
              >
                <Copy className="size-4" />
                Copy my creator invite link
              </button>
              {!cardPublished && (
                <p className="mt-3 text-[0.8125rem] text-ink/50">
                  Publish your Creator Card to unlock your invite link.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-[#dbe7f7] bg-gradient-to-br from-[#f3f9ff] to-[#eef4ff] p-6">
              <div className="rounded-2xl bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-ink">
                    <UserPlus className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-ink">
                      Your creator invite link
                    </p>
                    <p className="text-[0.8125rem] text-ink/50">
                      Every signup is attributed automatically
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f6f9ff] px-4 py-3">
                  <Link2 className="size-4 shrink-0 text-ink/40" />
                  <span className="min-w-0 flex-1 truncate text-[0.875rem] font-medium text-naano-blue">
                    {creatorLink.replace(/^https?:\/\//, "")}
                  </span>
                  <Copy className="size-4 shrink-0 text-ink/40" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 divide-x divide-neutral-200 rounded-2xl bg-white">
                <div className="p-5">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
                    Your share
                  </p>
                  <p className="mt-2 font-display text-[1.75rem] font-semibold text-ink">
                    25%
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
                    Earning window
                  </p>
                  <p className="mt-2 font-display text-[1.75rem] font-semibold text-ink">
                    3 months
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink/50">
                The window starts with their first completed paid collaboration —
                never at signup.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#e6e8ef] bg-[#e6e8ef] sm:grid-cols-3">
            {[
              { label: "Rewards earned", value: formatEuros(rewardsEarnedCents), caption: "—" },
              { label: "Creators invited", value: String(creatorsInvited), caption: `${creatorsInvited} cards published` },
              { label: "Earning now", value: String(earningNow), caption: "Inside the three-month window" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6">
                <p className="text-[0.875rem] text-ink/55">{stat.label}</p>
                <p className="mt-2 font-display text-[1.75rem] font-semibold text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-[0.75rem] text-ink/45">{stat.caption}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
