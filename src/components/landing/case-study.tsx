import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

const TRUSTED = ["lemlist", "folk.", "LEADBAY", "ringover", "attio", "La Growth Machine", "gojiberry", "ChatSEO", "Abyssale"];

export function CaseStudy() {
  return (
    <section id="companies" className="sky-fade py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[2.75rem]">
          Real teams. Measurable pipeline.
        </h2>
        <p className="mt-3 text-sm text-ink/55 sm:text-base">
          See how B2B teams turn creator trust into attributable demand with Naano.
        </p>

        <div className="mt-10 rounded-[2rem] bg-white/60 p-4 ring-1 ring-black/5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            {/* Video testimonial */}
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="text-[0.625rem] font-semibold tracking-[0.16em] text-ink/40 uppercase">
                Video testimonial
              </div>
              <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-300 to-neutral-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="size-5 fill-ink text-ink" />
                  </span>
                </div>
                <span className="absolute right-3 bottom-3 rounded-md bg-black/60 px-1.5 py-0.5 text-[0.625rem] font-medium text-white">
                  2:40
                </span>
                <span className="absolute bottom-3 left-3 text-[0.625rem] leading-tight text-white/90">
                  Vincent Josse
                  <br />
                  Founder of BlogSEO
                </span>
              </div>
              <p className="mt-4 font-display text-lg leading-snug font-semibold text-ink">
                &ldquo;Naano became one of our fastest acquisition channels. We know
                exactly what every creator brings.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sky-50/70 px-3 py-2.5">
                <div className="size-9 rounded-full bg-gradient-to-br from-sky-300 to-sky-500" />
                <div>
                  <div className="text-xs font-semibold text-ink">Vincent Josse</div>
                  <div className="text-[0.6875rem] text-ink/55">CEO &amp; Founder, BlogSEO</div>
                </div>
              </div>
            </div>

            {/* Case study */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                <span className="text-[0.625rem] font-semibold tracking-[0.16em] text-ink/40 uppercase">
                  Case study
                </span>
                <span className="text-sm font-semibold text-ink">BlogSEO</span>
              </div>

              <h3 className="mt-4 font-display text-2xl leading-tight font-semibold text-ink">
                How BlogSEO turned creator content into product signups
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/55">
                BlogSEO briefed SEO &amp; SaaS creators on LinkedIn and X, then traced
                every trial back to the post that drove it, all in Naano.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-5">
                {[
                  { v: "7", l: "creators activated" },
                  { v: "2,207", l: "qualified clicks" },
                  { v: "384", l: "trials started" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-3xl font-semibold text-ink">{s.v}</div>
                    <div className="mt-0.5 text-[0.6875rem] text-ink/50">{s.l}</div>
                  </div>
                ))}
              </div>

              <Link
                href="#case-study"
                className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink"
              >
                Read case study
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <div className="text-[0.625rem] font-semibold tracking-[0.16em] text-ink/40 uppercase">
                  Trusted by teams at
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {TRUSTED.map((t) => (
                    <span key={t} className="text-xs font-semibold text-ink/55">
                      {t}
                    </span>
                  ))}
                  <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[0.625rem] text-ink/50">
                    +30
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
