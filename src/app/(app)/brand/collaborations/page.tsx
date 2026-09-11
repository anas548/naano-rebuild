import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { STATUS_STYLES, submittedPost } from "@/lib/collaborations";
import { BRAND_COLLAB_TABS, resolveBrandTab } from "@/lib/brand-collaborations";
import { BrandCollaborationAction } from "@/components/brand/collaboration-action";
import { cn } from "@/lib/utils";

const COLUMNS = ["Creator", "Campaign", "Status", "Next action", "Amount", "Updated", "Action"];

export default async function BrandCollaborationsPage({
  searchParams,
}: PageProps<"/brand/collaborations">) {
  const user = await requireUser();
  const { tab: tabParam } = await searchParams;
  const tab = resolveBrandTab(typeof tabParam === "string" ? tabParam : undefined);

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true, balanceCents: true },
  });

  const rows = await prisma.collaboration.findMany({
    where: { campaign: { brandId: brand.id } },
    orderBy: { updatedAt: "desc" },
    include: {
      campaign: { select: { name: true } },
      creator: { include: { user: { select: { firstName: true, lastName: true } } } },
      posts: { select: { linkedinUrl: true } },
    },
  });

  const counts = Object.fromEntries(
    BRAND_COLLAB_TABS.map((t) => [t.slug, rows.filter((r) => t.match(r)).length]),
  );
  const visible = rows.filter((r) => tab.match(r));

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
            Collaborations
          </h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink/50">
            Accept applications, approve submitted posts, and track every deal
            in one place.
          </p>
        </div>
        <span className="shrink-0 rounded-xl border border-[#e6e8ef] bg-white px-4 py-2.5 text-[0.8125rem] font-semibold text-ink">
          {formatEuros(brand.balanceCents)} available
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-[#e6e8ef]">
        {BRAND_COLLAB_TABS.map((t) => {
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

      <div className="mt-5 overflow-hidden rounded-xl border border-[#e6e8ef] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead>
              <tr className="border-b border-[#e6e8ef]">
                {COLUMNS.map((column) => (
                  <th key={column} className="px-5 py-4 text-[0.8125rem] font-semibold text-ink/70">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-14 text-center text-[0.875rem] text-ink/50">
                    No collaborations yet, invite a creator from the{" "}
                    <Link href="/brand/creators" className="font-semibold text-naano-violet">
                      Marketplace
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-100 last:border-b-0">
                    <td className="px-5 py-4 text-[0.875rem] font-semibold text-ink">
                      {row.creator.user.firstName} {row.creator.user.lastName}
                    </td>
                    <td className="px-5 py-4 text-[0.875rem] text-ink/70">{row.campaign.name}</td>
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
                      {row.nextAction ?? <span className="text-ink/35">—</span>}
                    </td>
                    <td className="px-5 py-4 text-[0.875rem] font-semibold text-ink">
                      {formatEuros(row.amountCents)}
                    </td>
                    <td className="px-5 py-4 text-[0.875rem] text-ink/50">
                      {row.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <BrandCollaborationAction
                        collaborationId={row.id}
                        status={row.status}
                        submittedLinkedinUrl={submittedPost(row.posts)?.linkedinUrl ?? null}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
