import Link from "next/link";
import { Sparkles, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { brandPaysCents } from "@/lib/pricing";
import { countryName } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { AiMatchingStatic } from "@/components/brand/ai-matching-static";
import { MarketplaceCreatorCard } from "@/components/brand/marketplace-creator-card";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CreatorsPage({
  searchParams,
}: PageProps<"/brand/creators">) {
  const user = await requireUser();
  const params = await searchParams;
  const tab = params.tab === "marketplace" ? "marketplace" : "matching";

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true, name: true, icps: { orderBy: { rank: "asc" }, select: { title: true } } },
  });

  const tabHref = (t: string) => `/brand/creators${t === "matching" ? "" : `?tab=${t}`}`;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-[#e6e8ef] bg-white p-1">
          <Link
            href={tabHref("matching")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition-colors",
              tab === "matching" ? "bg-ink text-white" : "text-ink/60 hover:text-ink",
            )}
          >
            <Sparkles className="size-4" />
            AI Matching
          </Link>
          <Link
            href={tabHref("marketplace")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition-colors",
              tab === "marketplace" ? "bg-ink text-white" : "text-ink/60 hover:text-ink",
            )}
          >
            <Store className="size-4" />
            Creator Marketplace
          </Link>
        </div>
      </div>

      {tab === "matching" ? (
        <AiMatchingView brandName={brand.name ?? "there"} icpTitles={brand.icps.map((i) => i.title)} />
      ) : (
        <MarketplaceView brandId={brand.id} searchParams={params} />
      )}
    </div>
  );
}

function AiMatchingView({ brandName, icpTitles }: { brandName: string; icpTitles: string[] }) {
  const suggestions = [
    icpTitles[0]
      ? `Find creators who already reach ${icpTitles[0]}`
      : "Find creators who already reach your ideal customer",
    "Find creators with credible content about B2B",
    "Build a shortlist for this campaign's angle",
    `Build a balanced creator shortlist for ${brandName}`,
  ];

  return <AiMatchingStatic brandName={brandName} suggestions={suggestions} />;
}

async function MarketplaceView({
  brandId,
  searchParams,
}: {
  brandId: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const selectedIndustries = toArray(searchParams.industry);
  const country = typeof searchParams.country === "string" ? searchParams.country : "";
  const maxPriceEuros = typeof searchParams.maxPrice === "string" ? searchParams.maxPrice : "";
  const maxPriceCents = maxPriceEuros ? Math.round(Number(maxPriceEuros) * 100) : null;

  const [industries, availableCountries, creators, activeCampaigns, existingCollabs] = await Promise.all([
    prisma.industry.findMany({ orderBy: { label: "asc" } }),
    prisma.creatorProfile.findMany({
      where: { onboardingCompleted: true, country: { not: null } },
      distinct: ["country"],
      select: { country: true },
    }),
    prisma.creatorProfile.findMany({
      where: {
        onboardingCompleted: true,
        ...(selectedIndustries.length > 0
          ? { industries: { some: { id: { in: selectedIndustries } } } }
          : {}),
        ...(country ? { country } : {}),
        ...(maxPriceCents && Number.isFinite(maxPriceCents)
          ? { pricePerPostCents: { lte: maxPriceCents } }
          : {}),
      },
      orderBy: { pricePerPostCents: "asc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        industries: { select: { label: true } },
      },
    }),
    prisma.campaign.findMany({
      where: { brandId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.collaboration.findMany({
      where: { campaign: { brandId, status: "ACTIVE" } },
      select: { creatorId: true, campaignId: true },
    }),
  ]);

  const linkedPerCreator = new Map<string, Set<string>>();
  for (const c of existingCollabs) {
    const set = linkedPerCreator.get(c.creatorId) ?? new Set<string>();
    set.add(c.campaignId);
    linkedPerCreator.set(c.creatorId, set);
  }

  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-[16rem_1fr]">
      <form method="get" className="h-fit rounded-2xl border border-[#e6e8ef] bg-white p-5">
        <input type="hidden" name="tab" value="marketplace" />

        <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
          Country
        </p>
        <select
          name="country"
          defaultValue={country}
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[0.8125rem] text-ink outline-none focus:border-naano-blue"
        >
          <option value="">Any country</option>
          {availableCountries
            .map((c) => c.country!)
            .sort((a, b) => countryName(a).localeCompare(countryName(b)))
            .map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
        </select>

        <p className="mt-5 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
          Max price / post (EUR)
        </p>
        <input
          type="number"
          name="maxPrice"
          min="0"
          defaultValue={maxPriceEuros}
          placeholder="No limit"
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[0.8125rem] text-ink outline-none placeholder:text-ink/35 focus:border-naano-blue"
        />

        <p className="mt-5 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
          Industries
        </p>
        <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {industries.map((industry) => (
            <label key={industry.id} className="flex items-center gap-2 text-[0.8125rem] text-ink/70">
              <input
                type="checkbox"
                name="industry"
                value={industry.id}
                defaultChecked={selectedIndustries.includes(industry.id)}
                className="size-3.5 rounded border-neutral-300 text-naano-violet focus:ring-naano-violet"
              />
              {industry.label}
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-full bg-naano-violet px-4 py-2 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Apply filters
          </button>
          <Link
            href="/brand/creators?tab=marketplace"
            className="rounded-full border border-neutral-200 px-4 py-2 text-[0.8125rem] font-semibold text-ink/60 transition-colors hover:text-ink"
          >
            Clear
          </Link>
        </div>
      </form>

      <div>
        {activeCampaigns.length === 0 && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-[0.875rem] text-amber-900">
            <Link href="/brand/campaigns/new" className="font-semibold underline">
              Create a campaign
            </Link>{" "}
            before inviting creators — there&apos;s nowhere to add them yet.
          </p>
        )}

        {creators.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#dfe3ea] bg-white px-6 py-16 text-center">
            <Store className="mx-auto size-6 text-ink/25" />
            <h2 className="mt-4 font-display text-[1.0625rem] font-semibold text-ink">
              No creators match these filters
            </h2>
            <p className="mx-auto mt-1.5 max-w-[22rem] text-[0.875rem] text-ink/50">
              Try widening the price limit or clearing an industry filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => {
              const linked = linkedPerCreator.get(creator.id) ?? new Set<string>();
              const availableCampaigns = activeCampaigns.filter((c) => !linked.has(c.id));

              return (
                <MarketplaceCreatorCard
                  key={creator.id}
                  creator={{
                    id: creator.id,
                    name: `${creator.user.firstName} ${creator.user.lastName}`,
                    headline: creator.headline,
                    industries: creator.industries.map((i) => i.label),
                    countryCode: creator.country,
                    brandPaysCents: brandPaysCents(creator.pricePerPostCents),
                  }}
                  campaigns={availableCampaigns}
                  alreadyLinked={activeCampaigns.length > 0 && availableCampaigns.length === 0}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
