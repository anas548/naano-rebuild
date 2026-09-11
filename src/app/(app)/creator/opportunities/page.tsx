import Link from "next/link";
import { Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { ApplyButton } from "@/components/creator/apply-button";

export default async function OpportunitiesPage() {
  const user = await requireUser();

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, pricePerPostCents: true },
  });

  const [campaigns, existing] = await Promise.all([
    prisma.campaign.findMany({
      where: { openToApplications: true, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { brand: { select: { name: true } } },
    }),
    profile
      ? prisma.collaboration.findMany({
          where: { creatorId: profile.id },
          select: { campaignId: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  const applied = new Map(existing.map((c) => [c.campaignId, c.status]));
  const noPrice = !profile?.pricePerPostCents;

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Opportunities
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/50">
        Open brand campaigns - apply, the brand accepts, and the booking is
        created on your terms.
      </p>

      {noPrice && (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-[0.875rem] text-amber-900">
          Set your price per post on{" "}
          <Link href="/creator/card" className="font-semibold underline">
            My card
          </Link>{" "}
          before applying, so brands know what a booking costs.
        </p>
      )}

      {campaigns.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[#e6e8ef] bg-white px-6 py-16 text-center">
          <Store className="mx-auto size-6 text-ink/25" />
          <h2 className="mt-4 font-display text-[1.0625rem] font-semibold text-ink">
            No open campaigns right now
          </h2>
          <p className="mx-auto mt-1.5 max-w-[24rem] text-[0.875rem] text-ink/50">
            When a brand opens a campaign to applications, it will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {campaigns.map((campaign) => {
            const status = applied.get(campaign.id);

            return (
              <article
                key={campaign.id}
                className="flex flex-col rounded-xl border border-[#e6e8ef] bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#ecf1ff] font-display text-[0.9375rem] font-semibold text-naano-violet">
                    {campaign.brand.name?.charAt(0).toUpperCase() ?? "B"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.9375rem] font-semibold text-ink">
                      {campaign.brand.name ?? "Brand"}
                    </p>
                    <p className="text-[0.75rem] text-ink/45">
                      Budget committed {formatEuros(campaign.committedBudgetCents)}
                    </p>
                  </div>
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

                <div className="mt-6 flex items-end justify-between gap-4 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
                      You would receive
                    </p>
                    <p className="mt-1 font-display text-[1.25rem] font-semibold text-ink">
                      {profile?.pricePerPostCents
                        ? `${formatEuros(profile.pricePerPostCents)} / post`
                        : "Set your rate"}
                    </p>
                  </div>

                  {status ? (
                    <span className="rounded-full bg-[#e2faef] px-4 py-2 text-[0.8125rem] font-semibold text-[#00834a]">
                      {humanizeStatus(status)}
                    </span>
                  ) : (
                    <ApplyButton
                      campaignId={campaign.id}
                      disabledReason={
                        noPrice ? "Set your price per post first" : undefined
                      }
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
