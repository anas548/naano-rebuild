import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    eyebrow: "Self-serve",
    name: "Run it yourself.",
    blurb: "For teams that want the infrastructure to run creator campaigns in-house.",
    price: "€0",
    priceSuffix: "/ month",
    features: [
      "Creator marketplace access",
      "AI-powered brief creation",
      "Track clicks, companies and pipeline",
      "Automatic creator payouts",
    ],
    cta: { label: "Start for free", href: "/signup", solid: false },
  },
  {
    eyebrow: "Managed campaigns",
    name: "Get your time back.",
    blurb: "For teams that want Naano to operate their creator channel end to end.",
    price: "Custom quote",
    priceSuffix: null,
    features: [
      "Campaign strategy and positioning",
      "Creator sourcing and coordination",
      "Brief creation and campaign launch",
      "Reporting and optimisation",
    ],
    cta: { label: "Book a campaign call", href: "#book", solid: true },
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-[#fbfaf8] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
          Pricing.
        </h2>
        <p className="mt-4 font-display text-lg font-semibold text-ink">
          Start free. Upgrade when you want your time back.
        </p>
        <p className="mt-1.5 text-sm text-ink/55">
          Choose whether you want to run creator campaigns in-house or have Naano
          operate them.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5"
            >
              <div className="text-[0.625rem] font-semibold tracking-[0.16em] text-ink/40 uppercase">
                {plan.eyebrow}
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                {plan.name}
              </h3>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink/55">
                {plan.blurb}
              </p>

              <div className="mt-7 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight text-ink">
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span className="text-sm text-ink/45">{plan.priceSuffix}</span>
                )}
              </div>

              <ul className="mt-7 flex-1 space-y-0">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="border-t border-neutral-100 py-3.5 text-sm text-ink/75"
                  >
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {plan.cta.solid ? (
                  <Button nativeButton={false} render={<Link href={plan.cta.href} />}
                    className="group rounded-full bg-ink px-6 py-5 text-white hover:bg-ink/90">
                      {plan.cta.label}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                ) : (
                  <Link
                    href={plan.cta.href}
                    className="group inline-flex items-center gap-1.5 border-b border-ink/20 pb-1 text-sm font-semibold text-ink"
                  >
                    {plan.cta.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-[0.8125rem] text-ink/45">
          <ShieldCheck className="size-3.5" />
          Campaign spend is separate. No lock-in. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
