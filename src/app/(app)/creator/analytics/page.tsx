import { Activity, Eye, FileText, ShieldCheck, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCreatorProfile } from "@/lib/creator";

export default async function CreatorAnalyticsPage() {
  const user = await requireUser();
  const profile = await getCreatorProfile(user.id);

  const posts = profile?.publicPostCount ?? 0;
  const reach = profile?.publicPostReach ?? 0;
  const engagements = profile?.publicEngagements ?? 0;
  const followers = profile?.followerCount ?? 0;
  // Nothing is imported while LinkedIn import is paused, so this stays at zero.
  const postsWithReach = reach > 0 ? posts : 0;
  const reachCoverage = posts > 0 ? Math.round((postsWithReach / posts) * 100) : 0;

  const stats = [
    { icon: FileText, label: "Public posts", value: String(posts), caption: "Original LinkedIn posts found" },
    { icon: Eye, label: "Public post reach", value: reach > 0 ? reach.toLocaleString() : "Pending", caption: "Waiting for public post data" },
    { icon: Activity, label: "Public engagements", value: String(engagements), caption: "Reactions, comments and reposts" },
    { icon: Users, label: "LinkedIn followers", value: followers > 0 ? followers.toLocaleString() : "Pending", caption: "Imported from the public profile" },
  ];

  const summary = [
    { label: "LinkedIn followers", value: followers },
    { label: "Public posts", value: posts },
    { label: "Posts with reach data", value: postsWithReach },
    { label: "Public engagements", value: engagements },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
            Analytics
          </h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink/50">
            Public LinkedIn performance imported for this profile.
          </p>
        </div>
        <span className="rounded-lg border border-[#e6e8ef] bg-white px-4 py-2.5 text-[0.875rem] text-ink/70">
          All time
        </span>
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-[#e6e8ef] bg-gradient-to-r from-[#eef6ff] to-[#f7fbff] p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/50 uppercase">
              <span className="size-1.5 rounded-full bg-[#00b14e]" />
              Public LinkedIn snapshot
            </p>
            <h2 className="mt-3 font-display text-[1.625rem] font-semibold tracking-[-0.02em] text-ink">
              {posts > 0
                ? "Public LinkedIn posts imported"
                : "Public LinkedIn posts are being imported"}
            </h2>
            <p className="mt-2 max-w-[34rem] text-[0.875rem] leading-relaxed text-ink/55">
              The profile is ready. Post history and reach will appear after the
              public-data job completes.
            </p>
          </div>

          <div className="shrink-0 border-l border-[#d7e4f3] pl-6 lg:w-64">
            <p className="font-display text-[2rem] font-semibold text-ink">
              {reachCoverage}%
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink/55">
              of imported posts include reach data
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.75rem] font-medium text-ink/70 shadow-sm">
              <span className="size-1.5 rounded-full bg-[#00b14e]" />
              {posts > 0 ? `${posts} public posts found` : "No public post found yet"}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, caption }) => (
          <div key={label} className="rounded-xl border border-[#e6e8ef] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/55 uppercase">
                {label}
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#ecf1ff]">
                <Icon className="size-3.5 text-naano-violet" />
              </span>
            </div>
            <div className="mt-3 font-display text-[1.625rem] font-bold text-ink">
              {value}
            </div>
            <p className="mt-2 text-[0.8125rem] text-ink/45">{caption}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            Recent LinkedIn posts
          </h2>
          <p className="mt-1 text-[0.8125rem] text-ink/50">
            Open the original post on LinkedIn.
          </p>
          <div className="py-14 text-center">
            <p className="text-[0.9375rem] font-semibold text-ink/70">
              Public post import in progress
            </p>
            <p className="mx-auto mt-1.5 max-w-[26rem] text-[0.875rem] text-ink/50">
              The first public LinkedIn posts will appear here automatically.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            Public profile summary
          </h2>
          <p className="mt-1 text-[0.8125rem] text-ink/50">
            Automatically collected from public LinkedIn data.
          </p>
          <dl className="mt-5">
            {summary.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-b-0"
              >
                <dt className="text-[0.875rem] text-ink/60">{row.label}</dt>
                <dd className="text-[0.875rem] font-semibold text-ink">
                  {row.value.toLocaleString()}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#e6e8ef] bg-white p-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ecf1ff]">
          <ShieldCheck className="size-4 text-naano-violet" />
        </span>
        <div>
          <p className="text-[0.875rem] font-semibold text-ink">
            Public LinkedIn data is being prepared
          </p>
          <p className="mt-0.5 text-[0.8125rem] text-ink/50">
            Naano is collecting the creator&apos;s recent public posts. No
            personal LinkedIn connection is required.
          </p>
        </div>
      </div>
    </div>
  );
}
