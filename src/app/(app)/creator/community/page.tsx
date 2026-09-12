import { ArrowRight, Check, ExternalLink, Share2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCreatorProfile } from "@/lib/creator";
import { CreatorCard } from "@/components/creator/creator-card";
import { LinkedInIcon } from "@/components/landing/icons";

const SLACK_POINTS = [
  "Get feedback before you publish",
  "Share campaign tips that work",
  "Talk directly with the Naano team",
];

export default async function CreatorCommunityPage() {
  const user = await requireUser();

  const [profile, leaders] = await Promise.all([
    getCreatorProfile(user.id),
    prisma.creatorProfile.findMany({
      where: { onboardingCompleted: true },
      orderBy: { publicPostReach: "desc" },
      take: 30,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const peak = Math.max(1, ...leaders.map((l) => l.publicPostReach));

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Community
      </h1>
      <div className="flex items-start justify-between gap-4">
        <p className="mt-1.5 max-w-[30rem] text-[0.9375rem] text-ink/50">
          Learn with other B2B creators, share what works and make your Naano
          identity visible.
        </p>
        <span className="mt-1.5 inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e6e8ef] bg-white px-4 py-1.5 text-[0.8125rem] font-medium text-ink/70">
          <span className="size-1.5 rounded-full bg-[#00b14e]" />
          Creator network
        </span>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <div className="flex gap-5">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-[#f6f8fc]">
              <span className="font-display text-2xl font-semibold text-ink/25">#</span>
            </div>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/45 uppercase">
                Naano creators on Slack
              </p>
              <h2 className="mt-2 font-display text-[1.25rem] leading-snug font-semibold text-ink">
                The room where B2B creators get better together.
              </h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink/55">
                Ask for feedback on a sponsored post, compare campaign lessons,
                meet creators in your language and help shape what Naano builds
                next.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {SLACK_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-[0.875rem] text-ink/70">
                <Check className="size-4 shrink-0 text-[#00b14e]" />
                {point}
              </li>
            ))}
          </ul>

          <span className="mt-6 flex items-center justify-between rounded-xl border border-[#e6e8ef] px-4 py-3 text-[0.875rem] font-semibold text-ink">
            Join the Slack community
            <ExternalLink className="size-4 text-ink/40" />
          </span>
        </section>

        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f1fb]">
              <LinkedInIcon className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/45 uppercase">
                LinkedIn visibility
              </p>
              <h2 className="mt-1.5 font-display text-[1.125rem] leading-snug font-semibold text-ink">
                Turn your LinkedIn profile into an always-on Deal Link
              </h2>
            </div>
          </div>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink/55">
            Add your creator card to LinkedIn so brands can discover your work
            and join Naano through your attributed link.
          </p>

          <div className="mt-4 flex items-stretch gap-4 rounded-xl bg-[#f4f8ff] p-4">
            <div className="shrink-0 border-r border-[#dbe7f7] pr-4">
              <p className="font-display text-[1.375rem] font-semibold text-ink">25%</p>
              <p className="mt-0.5 text-[0.6875rem] leading-tight text-ink/50">
                of Naano&apos;s commission for 3 months
              </p>
            </div>
            <p className="text-[0.75rem] leading-relaxed text-ink/55">
              Leave your card on your LinkedIn profile. If a brand joins Naano
              through it, your reward is tracked automatically.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-[#e6e8ef] p-4">
            <p className="text-[0.875rem] font-semibold text-ink">Naano Creator</p>
            <p className="text-[0.8125rem] text-ink/55">Naano · Independent</p>
            <p className="text-[0.8125rem] text-ink/40">Present</p>
          </div>

          <div className="mt-5">
            <CreatorCard
              showShare
              className="mx-auto max-w-[340px]"
              data={{
                name: `${user.firstName} ${user.lastName}`,
                headline: profile?.headline ?? null,
                industries: profile?.industries.map((i) => i.label) ?? [],
                followerCount: profile?.followerCount ?? 0,
                estImpressions: null,
                pricePerPostCents: profile?.pricePerPostCents || null,
                hasPostData: (profile?.publicPostCount ?? 0) > 0,
                countryCode: profile?.country,
                avatarUrl: profile?.avatarUrl,
              }}
            />
          </div>

          <span className="mt-5 flex items-center justify-between rounded-xl bg-naano-blue px-5 py-3.5 text-[0.875rem] font-semibold text-white">
            <span className="flex items-center gap-2">
              <Share2 className="size-4" />
              Publish my card
            </span>
            <ArrowRight className="size-4" />
          </span>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-[#e6e8ef] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
              Naano campaign leaderboard
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink/50">
              Estimated impressions generated by sponsored posts published for
              Naano brand collaborations.
            </p>
          </div>
          <div className="flex items-center rounded-lg border border-[#e6e8ef] p-0.5 text-[0.8125rem] font-semibold">
            <span className="rounded-md bg-neutral-100 px-3 py-1.5 text-ink">
              Estimated impressions
            </span>
            <span className="px-3 py-1.5 text-ink/45">Posts</span>
          </div>
        </div>

        {leaders.length === 0 ? (
          <p className="py-12 text-center text-[0.875rem] text-ink/50">
            No creators on the leaderboard yet.
          </p>
        ) : (
          <ol className="mt-5">
            {leaders.map((leader, index) => {
              const name = `${leader.user.firstName} ${leader.user.lastName}`;
              const isYou = leader.userId === user.id;
              const medal = ["bg-[#fff7e0]", "bg-[#f1f3f7]", "bg-[#fbeee2]"][index];

              return (
                <li
                  key={leader.id}
                  className="flex items-center gap-4 border-b border-neutral-100 py-3 last:border-b-0"
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold text-ink/70 ${medal ?? ""}`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400 font-display text-[0.8125rem] font-semibold text-white">
                    {leader.user.firstName.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[0.875rem] font-semibold text-ink">
                        {name}
                      </span>
                      {isYou && (
                        <span className="rounded-full bg-[#ecf1ff] px-2 py-0.5 text-[0.6875rem] font-semibold text-naano-violet">
                          You
                        </span>
                      )}
                    </span>
                    <span className="block text-[0.75rem] text-ink/45">
                      {leader.cardSlug ? "Public creator card" : "Creator"}
                    </span>
                  </span>
                  <span className="hidden h-1.5 w-[40%] overflow-hidden rounded-full bg-neutral-100 sm:block">
                    <span
                      className="block h-full rounded-full bg-naano-blue"
                      style={{ width: `${Math.max(2, (leader.publicPostReach / peak) * 100)}%` }}
                    />
                  </span>
                  <span className="w-28 shrink-0 text-right">
                    <span className="block text-[0.875rem] font-semibold text-ink">
                      {leader.publicPostReach >= 1000
                        ? `${Math.round(leader.publicPostReach / 1000)}K`
                        : leader.publicPostReach}
                    </span>
                    <span className="block text-[0.625rem] text-ink/40">
                      estimated Naano impressions
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
