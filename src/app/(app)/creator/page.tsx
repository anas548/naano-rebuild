import Link from "next/link";
import {
  Activity,
  ChevronRight,
  CircleCheck,
  Copy,
  Eye,
  FileText,
  IdCard,
  Share2,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCreatorProfile } from "@/lib/creator";
import { CreatorCard } from "@/components/creator/creator-card";

export default async function CreatorOverviewPage() {
  const user = await requireUser();
  const profile = await getCreatorProfile(user.id);

  const stats = [
    {
      icon: Eye,
      label: "Public post reach",
      value: profile?.publicPostReach ? profile.publicPostReach.toLocaleString() : "—",
      caption: "Waiting for public post data",
    },
    {
      icon: FileText,
      label: "Public posts",
      value: String(profile?.publicPostCount ?? 0),
      caption: "Original LinkedIn posts found",
    },
    {
      icon: Activity,
      label: "Public engagements",
      value: String(profile?.publicEngagements ?? 0),
      caption: "Reactions, comments and reposts",
    },
    {
      icon: Users,
      label: "LinkedIn followers",
      value: profile?.followerCount ? profile.followerCount.toLocaleString() : "—",
      caption: "Imported from the public profile",
    },
  ];

  // The launch guide only has one step until onboarding is built out.
  const cardReady = Boolean(profile?.pricePerPostCents);
  const stepsComplete = cardReady ? 1 : 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <p className="text-[0.8125rem] font-semibold text-[#4d576b]">
        Creator workspace
      </p>
      <h1 className="mt-1.5 font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Good to see you, {user.firstName}
      </h1>
      <p className="mt-1 text-[0.9375rem] text-ink/50">
        Your creator activity, at a glance.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, caption }) => (
          <div
            key={label}
            className="rounded-xl border border-[#e6e8ef] bg-white p-5"
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-ink/35" />
              <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/55 uppercase">
                {label}
              </span>
            </div>
            <div className="mt-3 font-display text-[1.625rem] font-bold text-ink">
              {value}
            </div>
            <p className="mt-2 text-[0.8125rem] text-ink/45">{caption}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                Your creator card
              </h2>
              <p className="mt-1.5 max-w-[15rem] text-[0.8125rem] leading-relaxed text-ink/50">
                This is how brands discover your positioning and collaboration
                offer.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link
                href="/creator/card"
                className="flex items-center gap-2 rounded-lg border border-[#e6e8ef] px-3 py-2 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-neutral-50"
              >
                <IdCard className="size-4 text-ink/50" />
                Open card
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-[#e6e8ef] px-3 py-2 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-neutral-50"
              >
                <Copy className="size-4 text-ink/50" />
                Copy card link
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-naano-violet px-3 py-2 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Share2 className="size-4" />
                Share my card
              </button>
            </div>
          </div>

          <div className="mt-6">
            <CreatorCard
              showShare
              data={{
                name: `${user.firstName} ${user.lastName}`,
                headline: profile?.headline ?? null,
                industries: profile?.industries.map((i) => i.label) ?? [],
                followerCount: profile?.followerCount ?? 0,
                estImpressions: null,
                pricePerPostCents: profile?.pricePerPostCents || null,
                hasPostData: (profile?.publicPostCount ?? 0) > 0,
              }}
            />
          </div>
        </section>

        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                Your launch guide
              </h2>
              <p className="mt-1 text-[0.8125rem] text-ink/50">
                {stepsComplete} of 1 steps complete
              </p>
            </div>
            <Link
              href="/creator/card"
              className="text-[0.8125rem] font-semibold text-naano-violet"
            >
              Open card
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <CircleCheck
              className={
                cardReady
                  ? "size-7 shrink-0 fill-[#00b14e] text-white"
                  : "size-7 shrink-0 text-ink/20"
              }
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-[0.9375rem] font-semibold text-ink">
                Card and price ready
              </h3>
              <p className="mt-0.5 text-[0.8125rem] text-ink/50">
                {cardReady
                  ? "Your positioning and offer are ready to review."
                  : "Set your industries and price per post to finish your card."}
              </p>
            </div>
            <span
              className={
                cardReady
                  ? "rounded-md bg-[#e2faef] px-2.5 py-1 text-[0.75rem] font-semibold text-[#00834a]"
                  : "rounded-md bg-neutral-100 px-2.5 py-1 text-[0.75rem] font-semibold text-ink/50"
              }
            >
              {cardReady ? "Complete" : "To do"}
            </span>
            <Link
              href="/creator/card"
              aria-label="Open card"
              className="flex size-9 items-center justify-center rounded-lg border border-[#e6e8ef] text-ink/50 transition-colors hover:bg-neutral-50"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
