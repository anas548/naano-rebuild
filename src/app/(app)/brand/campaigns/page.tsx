import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { CAMPAIGN_STATUS_STYLES, CAMPAIGN_TABS, resolveCampaignTab } from "@/lib/campaigns";
import { cn } from "@/lib/utils";

export default async function CampaignsPage({
  searchParams,
}: PageProps<"/brand/campaigns">) {
  const user = await requireUser();
  const { tab: tabParam } = await searchParams;
  const tab = resolveCampaignTab(typeof tabParam === "string" ? tabParam : undefined);

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    include: {
      collaborations: {
        select: {
          creatorId: true,
          posts: { select: { publishedAt: true } },
        },
      },
    },
  });

  const counts = Object.fromEntries(
    CAMPAIGN_TABS.map((t) => [
      t.slug,
      t.statuses ? campaigns.filter((c) => t.statuses!.includes(c.status)).length : campaigns.length,
    ]),
  );

  const visible = tab.statuses
    ? campaigns.filter((c) => tab.statuses!.includes(c.status))
    : campaigns;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
          Campaigns
        </h1>
        <Link
          href="/brand/campaigns/new"
          className="inline-flex items-center gap-2 rounded-full bg-naano-violet px-5 py-2.5 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Create a campaign
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-[#e6e8ef]">
        {CAMPAIGN_TABS.map((t) => {
          const active = t.slug === tab.slug;
          return (
            <Link
              key={t.slug}
              href={t.slug === "all" ? "?" : `?tab=${t.slug}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 pb-3 text-[0.9375rem] transition-colors",
                active
                  ? "border-naano-violet font-semibold text-naano-violet"
                  : "border-transparent text-ink/60 hover:text-ink",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.75rem] font-semibold",
                  active ? "bg-naano-violet text-white" : "bg-neutral-100 text-ink/55",
                )}
              >
                {counts[t.slug]}
              </span>
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#dfe3ea] bg-white px-6 py-16 text-center">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            No campaigns {tab.slug === "all" ? "yet" : `in ${tab.label.toLowerCase()}`}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[24rem] text-[0.875rem] text-ink/50">
            Launch one to start inviting creators from the Marketplace.
          </p>
          <Link
            href="/brand/campaigns/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-naano-violet px-5 py-2.5 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Create a campaign
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((campaign) => {
            const creatorsCount = new Set(campaign.collaborations.map((c) => c.creatorId)).size;
            const publishedCount = campaign.collaborations.reduce(
              (n, c) => n + c.posts.filter((p) => p.publishedAt).length,
              0,
            );

            return (
              <Link
                key={campaign.id}
                href={`/brand/campaigns/${campaign.id}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#e6e8ef] bg-white transition-shadow hover:shadow-[0_12px_30px_-16px_rgba(11,11,15,0.25)]"
              >
                <div className="sky-fade h-16" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[0.75rem] font-semibold",
                        CAMPAIGN_STATUS_STYLES[campaign.status],
                      )}
                    >
                      {humanizeStatus(campaign.status)}
                    </span>
                    <span className="text-[0.75rem] text-ink/40">
                      {campaign.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-[1.0625rem] font-semibold text-ink">
                    {campaign.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-ink/55">
                    {campaign.briefProduct}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
                    <div>
                      <p className="font-display text-[1.0625rem] font-semibold text-ink">
                        {creatorsCount}
                      </p>
                      <p className="text-[0.6875rem] text-ink/45">Creators</p>
                    </div>
                    <div>
                      <p className="font-display text-[1.0625rem] font-semibold text-ink">
                        {publishedCount}
                      </p>
                      <p className="text-[0.6875rem] text-ink/45">Published</p>
                    </div>
                    <div>
                      <p className="font-display text-[1.0625rem] font-semibold text-ink">
                        {formatEuros(campaign.committedBudgetCents)}
                      </p>
                      <p className="text-[0.6875rem] text-ink/45">Budget</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
