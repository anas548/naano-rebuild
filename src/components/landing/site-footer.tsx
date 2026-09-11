import Link from "next/link";
import { Star } from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { LinkedInIcon } from "@/components/landing/icons";

const COLUMNS = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "FAQs", "Blog", "Reports & benchmarks", "About"],
  },
  {
    heading: "Company",
    links: ["Help Center", "Privacy", "Terms of Sale & Use"],
    subHeading: "For AI agents",
    subLinks: ["llms.txt", "pricing.md", "Reports & data"],
  },
  {
    heading: "Press",
    links: [
      "Interview Thomas Marcelle, Xymag.tv",
      "Naano on FounderTrace",
      "Naano on TechnicalBeep",
    ],
  },
];

const RESOURCES = [
  "LinkedIn creator marketplace",
  "Best B2B influencer platforms 2026",
  "B2B influencer marketing cost",
  "Launch a LinkedIn creator campaign",
  "LinkedIn Creator Marketplace in Europe",
  "How to pay B2B creators",
  "Creator Marketplace explained",
  "What is a B2B creator marketplace?",
  "Creator-led growth for B2B",
  "LinkedIn Ads vs creator-led CPL",
  "Nano vs macro creators in B2B",
  "B2B influence on LinkedIn",
  "Founder-led distribution for SaaS",
  "Naano vs alternatives",
];

export function SiteFooter() {
  return (
    <footer className="sky-footer pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)]">
          <div>
            <NaanoLogo />
            <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-ink/60">
              Turn LinkedIn creators into your best acquisition channel.
            </p>
            <Link href="#" aria-label="Naano on LinkedIn" className="mt-6 inline-block">
              <LinkedInIcon className="size-5" />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-[0.625rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">
                  {col.heading}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-[0.8125rem] text-ink/70 hover:text-ink">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
                {col.subHeading && (
                  <>
                    <h4 className="mt-6 text-[0.8125rem] font-semibold text-ink">
                      {col.subHeading}
                    </h4>
                    <ul className="mt-3 space-y-2.5">
                      {col.subLinks?.map((l) => (
                        <li key={l}>
                          <Link href="#" className="text-[0.8125rem] text-ink/70 hover:text-ink">
                            {l}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}

            <div>
              <h3 className="text-[0.625rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">
                Resources
              </h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {RESOURCES.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-[0.8125rem] text-ink/70 hover:text-ink">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row">
          <p className="text-[0.8125rem] text-ink/50">
            © 2026 naano. All rights reserved.
          </p>
          <Link href="#" className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink/60">
            <Star className="size-3.5 fill-emerald-500 text-emerald-500" />
            Trustpilot reviews
          </Link>
        </div>
      </div>
    </footer>
  );
}
