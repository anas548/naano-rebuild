import Link from "next/link";
import { ChevronRight, CreditCard, MessagesSquare, Store, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submittedPost } from "@/lib/collaborations";

// Results and Messages are still not built, so this page can't show real
// performance or a message preview yet — but the 4 stat cards and the To do
// list are wired to real Collaboration/Post rows, not placeholders.
export default async function BrandOverviewPage() {
  const user = await requireUser();

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  const [creatorsActivated, collaborationsCount, posts, toDoRows] = await Promise.all([
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
    prisma.collaboration.findMany({
      where: {
        campaign: { brandId: brand.id },
        OR: [{ status: "APPLIED" }, { status: "ACTIVE" }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        creator: { include: { user: { select: { firstName: true, lastName: true } } } },
        posts: { select: { linkedinUrl: true } },
      },
    }),
  ]);

  const toDo = toDoRows
    .filter((r) => r.status === "APPLIED" || submittedPost(r.posts))
    .slice(0, 4)
    .map((r) => ({
      id: r.id,
      name: `${r.creator.user.firstName} ${r.creator.user.lastName}`,
      action: r.status === "APPLIED" ? "Review application" : "Approve submitted post",
    }));

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

      <div className="mt-6 rounded-2xl border border-[#e6e8ef] bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-display text-[1.0625rem] font-semibold text-ink">To do</h2>
            <p className="text-[0.8125rem] text-ink/50">Priority actions</p>
          </div>
          {toDo.length > 0 && (
            <Link
              href="/brand/collaborations?tab=to-do"
              className="text-[0.8125rem] font-semibold text-naano-violet hover:underline"
            >
              See all
            </Link>
          )}
        </div>

        {toDo.length === 0 ? (
          <p className="border-t border-[#e6e8ef] px-6 py-8 text-[0.875rem] text-ink/50">
            Nothing needs your attention right now. Invite a creator from the{" "}
            <Link href="/brand/creators" className="font-semibold text-naano-violet">
              Marketplace
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 border-t border-[#e6e8ef]">
            {toDo.map((row) => (
              <Link
                key={row.id}
                href="/brand/collaborations"
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="text-[0.9375rem] font-medium text-ink">{row.name}</span>
                <span className="flex items-center gap-1.5 text-[0.8125rem] text-ink/50">
                  {row.action}
                  <ChevronRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
