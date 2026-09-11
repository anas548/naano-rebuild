import { Lock, Star } from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { LinkedInIcon } from "@/components/landing/icons";

type CreatorCard = {
  rank: number;
  name: string;
  niche: string;
  country: string;
  flag: string;
  bio: string;
  match: number;
  followers: string;
  views: string;
  cost: string;
};

const CREATORS: CreatorCard[] = [
  { rank: 1, name: "Aymane Junior", niche: "AI · SaaS", country: "Germany", flag: "🇩🇪", bio: "Building intelligent systems that turn data into impact. Turning complex problems into smart…", match: 97, followers: "14.1K", views: "18.7K", cost: "€360" },
  { rank: 2, name: "Emma Guetta", niche: "AI · Media / Content", country: "France", flag: "🇫🇷", bio: "Helping B2B teams turn content into a repeatable acquisition channel.", match: 96, followers: "7.8K", views: "25.6K", cost: "€480" },
  { rank: 3, name: "Augustin Rudigoz", niche: "Productivity · Fintech", country: "France", flag: "🇫🇷", bio: "Entrepreneurs, opérateurs investisseurs. Reprise de PME françaises aux côtés de leur…", match: 92, followers: "14K", views: "11.2K", cost: "€960" },
  { rank: 4, name: "Raghav Jerath", niche: "Growth / GTM · Software", country: "France", flag: "🇫🇷", bio: "International Business School graduate, experience working at a YC company, AI/…", match: 90, followers: "2.4K", views: "2.1K", cost: "€84" },
  { rank: 5, name: "Daniel Meisen", niche: "Growth / GTM · Agencies / Consulting", country: "Germany", flag: "🇩🇪", bio: "Scaling agencies with creator-led distribution and sharp positioning.", match: 89, followers: "5.9K", views: "2.8K", cost: "€120" },
  { rank: 6, name: "Pierre Davadan", niche: "SaaS · AI", country: "France", flag: "🇫🇷", bio: "VC Analyst Open CNP", match: 89, followers: "4.2K", views: "2.2K", cost: "€84" },
];

const FEATURES = [
  {
    title: "3,000+ vetted creators",
    body: "Specialist B2B voices, ready to collaborate.",
    visual: (
      <div className="flex -space-x-3">
        {["from-rose-200 to-rose-400", "from-sky-200 to-sky-400", "from-violet-200 to-violet-400", "from-amber-200 to-amber-400", "from-neutral-300 to-neutral-600"].map((g, i) => (
          <div key={i} className={`size-12 rounded-full bg-gradient-to-br ${g} ring-3 ring-white`} />
        ))}
      </div>
    ),
  },
  {
    title: "Across 100 countries",
    body: "Local expertise with genuinely global reach.",
    visual: (
      <div className="grid max-w-[190px] grid-cols-4 gap-3 text-2xl">
        {["🇫🇷", "🇺🇸", "🇩🇪", "🇬🇧", "🇪🇸", "🇨🇦", "🇳🇱"].map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
    ),
  },
  {
    title: "Matched to your buyers",
    body: "Audience fit comes before follower count.",
    visual: (
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="size-11 rounded-full bg-gradient-to-br from-fuchsia-200 to-violet-400" />
          <div className="mt-1 text-[0.5rem] text-ink/50">AI &amp; SaaS creator</div>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-ink">
          96%
        </div>
        <div className="space-y-1">
          {["Founders", "Sales leaders", "GTM teams"].map((t) => (
            <div key={t} className="rounded-full bg-white px-3 py-1 text-[0.625rem] text-ink/70 shadow-sm ring-1 ring-black/5">
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function CreatorMiniCard({ creator }: { creator: CreatorCard }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative bg-gradient-to-b from-sky-100 to-sky-50 px-4 pt-3 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-ink/40" />
            <LinkedInIcon className="size-3.5" />
          </div>
          <NaanoLogo className="scale-75" />
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-white px-2.5 py-1 text-[0.625rem] font-semibold text-ink shadow-sm">
              Book
            </span>
            <Star className="size-3.5 text-ink/30" />
          </div>
        </div>
        <span className="absolute bottom-1 left-3 font-display text-4xl font-semibold text-white/70">
          {creator.rank}
        </span>
      </div>

      <div className="relative -mt-6 px-4 pb-4 text-center">
        <div className="mx-auto size-12 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400 ring-3 ring-white" />
        <div className="mt-2 text-sm font-semibold text-ink">{creator.name}</div>
        <div className="text-[0.6875rem] text-ink/55">{creator.niche}</div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-0.5 text-[0.625rem] text-ink/70 ring-1 ring-black/5">
          <span>{creator.flag}</span>
          {creator.country}
        </div>
        <p className="mt-3 line-clamp-2 text-[0.6875rem] leading-relaxed text-ink/50">
          {creator.bio}
        </p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[0.5625rem] tracking-[0.1em] text-ink/45 uppercase">
            <span>◆ Matching</span>
            <span className="font-semibold text-ink">{creator.match}/100</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-naano-blue"
              style={{ width: `${creator.match}%` }}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 pt-3">
          {[
            { v: creator.followers, l: "Followers" },
            { v: creator.views, l: "Median views" },
            { v: creator.cost, l: "Post cost" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-xs font-semibold text-ink">{s.v}</div>
              <div className="text-[0.5rem] tracking-wide text-ink/45 uppercase">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Marketplace() {
  return (
    <section id="creators" className="sky-fade py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.8125rem] font-semibold text-ink shadow-sm ring-1 ring-black/5">
            <span className="size-1.5 rounded-full bg-naano-blue" />
            The Naano creator marketplace
          </span>
          <h2 className="mt-7 font-display text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
            Work with all the best creators.
          </h2>
          <p className="mt-5 text-base text-ink/60 sm:text-lg">
            Find the right B2B voices, compare their audience fit, and book every
            collaboration from one place.
          </p>
        </div>

        {/* Marketplace app mock */}
        <div className="mt-14 overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-200/70 to-white p-3 sm:p-5">
          <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_30px_80px_-30px_rgba(11,11,15,0.35)]">
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
              <div className="flex gap-1.5">
                {["bg-neutral-200", "bg-neutral-200", "bg-neutral-200"].map((c, i) => (
                  <span key={i} className={`size-2.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-full bg-neutral-50 px-4 py-1.5 text-xs text-ink/50 ring-1 ring-black/5">
                <Lock className="size-3" />
                naano.co/marketplace
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {CREATORS.map((c) => (
                <CreatorMiniCard key={c.rank} creator={c} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white/80 p-7 shadow-sm ring-1 ring-black/5 backdrop-blur"
            >
              <div className="flex h-28 items-center">{f.visual}</div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {f.title}
              </h3>
              <p className="mt-1 text-sm text-ink/55">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
