import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { OpportunitiesList } from "@/components/creator/opportunities-list";

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
        created on your terms. Ask the assistant below which one fits you best.
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

      <OpportunitiesList
        campaigns={campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          brandName: c.brand.name ?? "Brand",
          briefProduct: c.briefProduct,
          briefAudience: c.briefAudience,
          committedBudgetCents: c.committedBudgetCents,
          status: applied.get(c.id),
        }))}
        noPrice={noPrice}
        pricePerPostCents={profile?.pricePerPostCents ?? null}
      />
    </div>
  );
}
