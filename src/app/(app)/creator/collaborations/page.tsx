import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { CREATOR_TABS, STATUS_STYLES, resolveTab } from "@/lib/collaborations";
import { cn } from "@/lib/utils";

const COLUMNS = [
  "Brand",
  "Campaign",
  "Status",
  "Performance",
  "Next action",
  "Due date",
  "Your net",
];

export default async function CollaborationsPage({
  searchParams,
}: PageProps<"/creator/collaborations">) {
  const user = await requireUser();
  const { tab: tabParam } = await searchParams;
  const tab = resolveTab(typeof tabParam === "string" ? tabParam : undefined);

  const rows = await prisma.collaboration.findMany({
    where: { creator: { userId: user.id } },
    orderBy: { updatedAt: "desc" },
    include: {
      campaign: { include: { brand: { select: { name: true } } } },
      posts: {
        select: { impressions: true, qualifiedClicks: true, publishedAt: true },
      },
    },
  });

  const counts = Object.fromEntries(
    CREATOR_TABS.map((t) => [
      t.slug,
      t.statuses ? rows.filter((r) => t.statuses!.includes(r.status)).length : rows.length,
    ]),
  );

  const visible = tab.statuses
    ? rows.filter((r) => tab.statuses!.includes(r.status))
    : rows;

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Collaborations
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/50">
        Every step tells you where you stand, what to do, and what happens if you
        do nothing.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-[#e6e8ef]">
        {CREATOR_TABS.map((t) => {
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
                  active
                    ? "bg-naano-violet text-white"
                    : "bg-neutral-100 text-ink/55",
                )}
              >
                {counts[t.slug]}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-[#e6e8ef] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead>
              <tr className="border-b border-[#e6e8ef]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="px-5 py-4 text-[0.8125rem] font-semibold text-ink/70"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-14 text-center text-[0.875rem] text-ink/50"
                  >
                    No collaborations yet. Brand invitations and your accepted
                    applications land here.
                  </td>
                </tr>
              ) : (
                visible.map((row) => {
                  const published = row.posts.filter((p) => p.publishedAt);
                  const impressions = published.reduce((n, p) => n + p.impressions, 0);
                  const clicks = published.reduce((n, p) => n + p.qualifiedClicks, 0);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="px-5 py-4 text-[0.875rem] font-semibold text-ink">
                        {row.campaign.brand.name ?? "Brand"}
                      </td>
                      <td className="px-5 py-4 text-[0.875rem] text-ink/70">
                        {row.campaign.name}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-[0.75rem] font-semibold",
                            STATUS_STYLES[row.status],
                          )}
                        >
                          {humanizeStatus(row.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[0.875rem] text-ink/70">
                        {published.length === 0 ? (
                          <span className="text-ink/35">—</span>
                        ) : (
                          `${impressions.toLocaleString()} impressions · ${clicks.toLocaleString()} clicks`
                        )}
                      </td>
                      <td className="px-5 py-4 text-[0.875rem] text-ink/70">
                        {row.nextAction ?? <span className="text-ink/35">—</span>}
                      </td>
                      <td className="px-5 py-4 text-[0.875rem] text-ink/70">
                        {row.dueDate ? (
                          row.dueDate.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          <span className="text-ink/35">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[0.875rem] font-semibold text-ink">
                        {formatEuros(row.creatorNetCents)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#e6e8ef] px-5 py-3.5">
          <span className="text-[0.8125rem] text-ink/55">
            {visible.length} collaboration{visible.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-md bg-[#f2f0ff] px-2.5 py-1 text-[0.8125rem] font-semibold text-naano-violet">
            1
          </span>
          <span className="w-20" />
        </div>
      </div>
    </div>
  );
}
