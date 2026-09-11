import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { STATUS_STYLES } from "@/lib/collaborations";
import { CampaignForm } from "@/components/brand/campaign-form";
import { cn } from "@/lib/utils";

export default async function CampaignDetailPage({
  params,
}: PageProps<"/brand/campaigns/[id]">) {
  const user = await requireUser();
  const { id } = await params;

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true },
  });

  const campaign = await prisma.campaign.findFirst({
    where: { id, brandId: brand.id },
    include: {
      collaborations: {
        orderBy: { updatedAt: "desc" },
        include: { creator: { include: { user: { select: { firstName: true, lastName: true } } } } },
      },
    },
  });
  if (!campaign) notFound();

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link
        href="/brand/campaigns"
        className="inline-flex items-center gap-2 text-[0.875rem] text-ink/70 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to campaigns
      </Link>

      <h1 className="mt-5 font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        {campaign.name}
      </h1>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="rounded-2xl border border-[#e6e8ef] bg-white">
          <div className="flex items-center justify-between border-b border-[#e6e8ef] px-6 py-4">
            <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
              Roster
            </h2>
            <span className="text-[0.8125rem] text-ink/50">
              {campaign.collaborations.length} creator
              {campaign.collaborations.length === 1 ? "" : "s"}
            </span>
          </div>

          {campaign.collaborations.length === 0 ? (
            <div className="px-6 py-14 text-center text-[0.875rem] text-ink/50">
              No creators yet. Invite one from the{" "}
              <Link href="/brand/creators" className="font-semibold text-naano-violet">
                Marketplace
              </Link>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left">
                <thead>
                  <tr className="border-b border-[#e6e8ef]">
                    {["Creator", "Status", "Amount", "Updated"].map((c) => (
                      <th key={c} className="px-6 py-3 text-[0.8125rem] font-semibold text-ink/70">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaign.collaborations.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-100 last:border-b-0">
                      <td className="px-6 py-4 text-[0.875rem] font-semibold text-ink">
                        {row.creator.user.firstName} {row.creator.user.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-[0.75rem] font-semibold",
                            STATUS_STYLES[row.status],
                          )}
                        >
                          {humanizeStatus(row.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[0.875rem] text-ink/70">
                        {formatEuros(row.amountCents)}
                      </td>
                      <td className="px-6 py-4 text-[0.875rem] text-ink/50">
                        {row.updatedAt.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-[#e6e8ef] bg-white p-6">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            Edit brief
          </h2>
          <div className="mt-5">
            <CampaignForm
              mode="edit"
              defaults={{
                campaignId: campaign.id,
                name: campaign.name,
                briefProduct: campaign.briefProduct ?? "",
                briefAudience: campaign.briefAudience ?? "",
                committedBudget: campaign.committedBudgetCents
                  ? String(campaign.committedBudgetCents / 100)
                  : "",
                status: campaign.status,
                openToApplications: campaign.openToApplications,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
