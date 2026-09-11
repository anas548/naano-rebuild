import Link from "next/link";
import { Info, MousePointerClick, Radar, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "analytics", label: "Analytics" },
  { slug: "leads", label: "Leads" },
  { slug: "posts", label: "Posts" },
];

function thirtyDaysAgo() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }) };
  });
}

export default async function BrandResultsPage({
  searchParams,
}: PageProps<"/brand/results">) {
  const user = await requireUser();
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.slug === tabParam) ?? TABS[0];

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true },
  });

  const [posts, bookings] = await Promise.all([
    prisma.post.findMany({
      where: { collaboration: { campaign: { brandId: brand.id } } },
      orderBy: { publishedAt: "desc" },
      include: {
        collaboration: {
          include: {
            campaign: { select: { name: true } },
            creator: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    }),
    prisma.collaboration.findMany({
      where: { campaign: { brandId: brand.id }, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: { amountCents: true },
    }),
  ]);

  const published = posts.filter((p) => p.publishedAt);
  const estReach = published.reduce((n, p) => n + p.impressions, 0);
  const cutoff = thirtyDaysAgo();
  const qualifiedClicks30d = published
    .filter((p) => p.publishedAt! >= cutoff)
    .reduce((n, p) => n + p.qualifiedClicks, 0);
  const committedBudgetCents = bookings.reduce((n, b) => n + b.amountCents, 0);

  const months = lastSixMonths();
  const byMonth = new Map(months.map((m) => [m.key, 0]));
  for (const post of published) {
    const key = `${post.publishedAt!.getFullYear()}-${post.publishedAt!.getMonth()}`;
    if (byMonth.has(key)) byMonth.set(key, (byMonth.get(key) ?? 0) + post.qualifiedClicks);
  }
  const peak = Math.max(...byMonth.values());
  const barHeight = (value: number) => (peak === 0 ? 100 : Math.max(6, (value / peak) * 100));

  const reactions = published.reduce((n, p) => n + p.reactions, 0);
  const comments = published.reduce((n, p) => n + p.comments, 0);

  const attribution = new Map<string, { name: string; clicks: number }>();
  for (const post of published) {
    const creatorId = post.collaboration.creator.userId;
    const name = `${post.collaboration.creator.user.firstName} ${post.collaboration.creator.user.lastName}`;
    const row = attribution.get(creatorId) ?? { name, clicks: 0 };
    row.clicks += post.qualifiedClicks;
    attribution.set(creatorId, row);
  }
  const attributionRows = Array.from(attribution.values()).sort((a, b) => b.clicks - a.clicks);

  const stats = [
    {
      icon: Radar,
      label: "Est. reach",
      value: estReach.toLocaleString(),
      caption: published.length === 0 ? "No published posts yet" : `${published.length} posts published`,
    },
    {
      icon: MousePointerClick,
      label: "Qualified clicks",
      value: qualifiedClicks30d.toLocaleString(),
      caption: "last 30 days",
    },
    {
      icon: Wallet,
      label: "Committed budget",
      value: formatEuros(committedBudgetCents),
      caption: `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Results
      </h1>

      <div className="mt-5 flex gap-6 border-b border-[#e6e8ef]">
        {TABS.map((t) => (
          <Link
            key={t.slug}
            href={t.slug === "analytics" ? "?" : `?tab=${t.slug}`}
            aria-current={t.slug === tab.slug ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 pb-3 text-[0.9375rem] transition-colors",
              t.slug === tab.slug
                ? "border-naano-violet font-semibold text-naano-violet"
                : "border-transparent text-ink/60 hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab.slug === "leads" && (
        <div className="mt-6 rounded-xl border border-dashed border-[#dfe3ea] bg-white px-6 py-16 text-center">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            No leads tracked yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-[26rem] text-[0.875rem] text-ink/50">
            Leads need the tracking pixel connected to your site, which isn&apos;t
            wired up in this clone.
          </p>
        </div>
      )}

      {tab.slug === "posts" && (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e8ef] bg-white">
          {published.length === 0 ? (
            <p className="px-6 py-14 text-center text-[0.875rem] text-ink/50">
              No posts published yet. They&apos;ll appear here as soon as a
              creator submits a link on Collaborations.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] text-left">
                <thead>
                  <tr className="border-b border-[#e6e8ef]">
                    {["Creator", "Campaign", "Published", "Impressions", "Reactions", "Comments", "Link"].map(
                      (c) => (
                        <th key={c} className="px-5 py-3 text-[0.8125rem] font-semibold text-ink/70">
                          {c}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {published.map((post) => (
                    <tr key={post.id} className="border-b border-neutral-100 last:border-b-0">
                      <td className="px-5 py-3.5 text-[0.875rem] font-semibold text-ink">
                        {post.collaboration.creator.user.firstName}{" "}
                        {post.collaboration.creator.user.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-ink/70">
                        {post.collaboration.campaign.name}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-ink/50">
                        {post.publishedAt!.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-ink/70">
                        {post.impressions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-ink/70">
                        {post.reactions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-ink/70">
                        {post.comments.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {post.linkedinUrl && (
                          <a
                            href={post.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.8125rem] font-semibold text-naano-violet hover:underline"
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab.slug === "analytics" && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {stats.map(({ icon: Icon, label, value, caption }) => (
              <div key={label} className="rounded-xl border border-[#e6e8ef] bg-white p-5">
                <p className="flex items-center gap-1.5 text-[0.8125rem] text-ink/55">
                  <Icon className="size-4" />
                  {label}
                </p>
                <p className="mt-2 font-display text-[1.5rem] font-semibold text-ink">{value}</p>
                <p className="mt-1 text-[0.75rem] text-ink/45">{caption}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                  Performance over time
                </h2>
                <span className="flex items-center gap-1.5 text-[0.75rem] text-ink/45">
                  <span className="size-1.5 rounded-full bg-naano-violet" />
                  Qualified clicks
                </span>
              </div>
              <div className="mt-6 flex h-40 items-end gap-3">
                {months.map((m) => (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-naano-violet/15"
                        style={{ height: `${barHeight(byMonth.get(m.key) ?? 0)}%` }}
                      />
                    </div>
                    <span className="text-[0.75rem] text-ink/40">{m.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
              <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                Post performance
              </h2>
              <p className="mt-1 text-[0.8125rem] text-ink/50">
                Latest metrics collected from your posts.
              </p>
              <dl className="mt-5">
                {[
                  { label: "Posts", value: published.length },
                  { label: "reactions", value: reactions },
                  { label: "comments", value: comments },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-b-0">
                    <dt className="text-[0.875rem] text-ink/60">{row.label}</dt>
                    <dd className="text-[0.875rem] font-semibold text-ink">{row.value.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="?tab=posts"
                className="mt-4 inline-block text-[0.8125rem] font-semibold text-naano-violet hover:underline"
              >
                View posts →
              </Link>
            </section>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-[#e6e8ef] bg-white p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-ink/40" />
              <div>
                <p className="text-[0.875rem] font-semibold text-ink">Measure site conversions</p>
                <p className="mt-0.5 text-[0.8125rem] text-ink/50">
                  Connect the pixel to add visits, sign-ups and revenue to your post results.
                </p>
              </div>
            </div>
            <span className="shrink-0 text-[0.8125rem] font-semibold text-ink/40">
              Install the pixel
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#e6e8ef] bg-white">
            <div className="border-b border-[#e6e8ef] px-6 py-4">
              <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                Attribution by creator
              </h2>
            </div>
            {attributionRows.length === 0 ? (
              <p className="px-6 py-10 text-center text-[0.875rem] text-ink/50">
                No creator has engaged yet.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#e6e8ef]">
                    <th className="px-6 py-3 text-[0.8125rem] font-semibold text-ink/70">Creator</th>
                    <th className="px-6 py-3 text-[0.8125rem] font-semibold text-ink/70">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {attributionRows.map((row) => (
                    <tr key={row.name} className="border-b border-neutral-100 last:border-b-0">
                      <td className="px-6 py-3.5 text-[0.875rem] font-semibold text-ink">{row.name}</td>
                      <td className="px-6 py-3.5 text-[0.875rem] text-ink/70">{row.clicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
