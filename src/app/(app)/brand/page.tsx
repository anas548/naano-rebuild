import { CreditCard, MessagesSquare, Store, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

// Chunk 1 covers onboarding and the app shell only — the Overview page's real
// widgets (To do list, New creators rail, Messages preview) depend on the
// Marketplace and Collaborations pages, which come next. These 4 stat cards
// are wired to real data now so nothing here is fabricated while the rest of
// the dashboard is still being built.
export default async function BrandOverviewPage() {
  const user = await requireUser();

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  const [creatorsActivated, collaborationsCount, posts] = await Promise.all([
    prisma.collaboration.findMany({
      where: { campaign: { brandId: brand.id }, status: { in: ["ACTIVE", "COMPLETED"] } },
      distinct: ["creatorId"],
      select: { creatorId: true },
    }),
    prisma.collaboration.count({ where: { campaign: { brandId: brand.id } } }),
    prisma.post.findMany({
      where: { collaboration: { campaign: { brandId: brand.id } }, publishedAt: { not: null } },
      select: { impressions: true },
    }),
  ]);

  const stats = [
    { label: "Creators activated", value: creatorsActivated.length, icon: Users },
    { label: "Posts published", value: posts.length, icon: MessagesSquare },
    { label: "Profiles engaged", value: collaborationsCount, icon: Store },
    {
      label: "Impressions",
      value: posts.reduce((sum, p) => sum + p.impressions, 0),
      icon: CreditCard,
    },
  ];

  return (
    <div>
      <p className="text-[0.9375rem] text-ink/55">Hello {user.firstName} 👋</p>
      <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Here is what is happening for {brand.name} on Naano.
      </h1>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#e6e8ef] bg-white p-5"
          >
            <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink/55">
              <Icon className="size-4" />
              {label}
            </p>
            <p className="mt-2 font-display text-[1.75rem] font-semibold text-ink">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#e6e8ef] bg-white p-6">
        <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/45 uppercase">
          Coming next
        </p>
        <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-ink/60">
          Onboarding is done and your first campaign brief is saved. The
          Creators marketplace, Campaigns and Collaborations pages are next —
          once they&apos;re built, this page fills in with real creators,
          messages and to-dos instead of these four counters.
        </p>
      </div>
    </div>
  );
}
