import Link from "next/link";
import { ArrowRight, Eye, MousePointerClick, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkedInIcon } from "@/components/landing/icons";

const STATS = [
  { v: "5M+", l: "Impressions generated" },
  { v: "18K+", l: "Leads generated" },
  { v: "1,170+", l: "Creators on Naano" },
  { v: "3K+", l: "Posts published" },
];

const POSTS = [
  { name: "Thomas Higadère", role: "Creator · B2B & AI · 34K followers", text: "How AI changed our prospecting workflow for wealth managers and private bankers.", impressions: "42.8K", clicks: "312", leads: "18", brand: "lemlist" },
  { name: "Robin Tempe", role: "Creator · Sales & AI · 12K followers", text: "I run my entire prospecting workflow through an AI. Here is how.", impressions: "9K", clicks: "100", leads: "50", brand: "LEADBAY" },
  { name: "Eric Djavid", role: "Sales Leader · B2B · 40K followers", text: "Most sales teams spend 80% of their time on the wrong leads. Here is how I changed that.", impressions: "20K", clicks: "350", leads: "80", brand: "LEADBAY" },
  { name: "Marina Panova", role: "Content Creator · B2B · 34K followers", text: "How I build my 30-day LinkedIn content system, the exact playbook.", impressions: "100K", clicks: "1,600", leads: "320", brand: "Abyssale" },
];

export function Results() {
  return (
    <section className="sky-fade py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">
            <span className="size-1.5 rounded-full bg-naano-blue" />
            The results
          </p>
          <h2 className="mt-5 font-display text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
            Proven across thousands of campaigns.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 rounded-[2rem] bg-white/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/90 py-8 text-center shadow-sm ring-1 ring-black/5">
              <div className="font-display text-4xl font-semibold tracking-tight text-ink">{s.v}</div>
              <div className="mt-1.5 text-[0.8125rem] text-ink/55">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((p) => (
            <article key={p.name} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <header className="flex items-start gap-2.5">
                <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[0.8125rem] font-semibold text-ink">{p.name}</span>
                    <LinkedInIcon className="size-3.5 shrink-0" />
                  </div>
                  <div className="text-[0.625rem] leading-tight text-ink/50">{p.role}</div>
                </div>
              </header>

              <p className="mt-3 min-h-[3.75rem] text-[0.8125rem] leading-relaxed text-ink/85">
                {p.text}
              </p>

              <div className="mt-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-sky-100 to-neutral-200" />

              <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-neutral-50 px-2 py-2.5">
                {[
                  { Icon: Eye, v: p.impressions, l: "Impressions" },
                  { Icon: MousePointerClick, v: p.clicks, l: "Clicks" },
                  { Icon: Users, v: p.leads, l: "Leads" },
                ].map(({ Icon, v, l }) => (
                  <div key={l} className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Icon className="size-3 text-ink/40" />
                      <span className="text-xs font-semibold text-ink">{v}</span>
                    </div>
                    <div className="text-[0.5625rem] text-ink/45">{l}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                <span className="text-[0.625rem] text-ink/45">
                  For <span className="font-semibold text-ink/70">{p.brand}</span>
                </span>
                <Link href="#" className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-naano-blue">
                  View post
                  <ArrowRight className="size-3 -rotate-45" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center">
          <Button render={<Link href="/signup" />} size="lg" className="group rounded-full bg-ink px-6 text-white hover:bg-ink/90">
              Get started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          <p className="mt-3 text-[0.8125rem] text-ink/50">
            Start free. Pay per post when you&apos;re ready.
          </p>
        </div>
      </div>
    </section>
  );
}
