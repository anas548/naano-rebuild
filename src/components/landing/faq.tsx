import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is Naano?",
    a: "Naano is a B2B LinkedIn creator marketplace: companies discover and book vetted creators for sponsored LinkedIn campaigns, each at a fixed price per post set by the creator. The marketplace spans creators from niche voices with around 1,000 followers to established B2B creators with audiences of several hundred thousand.",
  },
  {
    q: "How does Naano find the right creators?",
    a: "Naano reads your website during onboarding to understand your product and your three main ideal customer profiles, then matches creators on audience fit rather than follower count. You can refine the shortlist yourself from the marketplace at any time.",
  },
  {
    q: "Which networks do you support?",
    a: "LinkedIn is the primary network, with X supported for campaigns that run across both.",
  },
  {
    q: "How does per-post pricing work?",
    a: "Every creator sets their own net price per post, visible on their marketplace card before you book. You commit budget to a campaign, and each booking draws against it.",
  },
  {
    q: "How does attribution work?",
    a: "Every post carries a tracking link, so clicks and leads are traced back to the creator who generated them. Installing the Naano pixel on your site extends that to visits, sign-ups and revenue.",
  },
  {
    q: "Do you handle creator payouts?",
    a: "Yes. Contracts, invoices and payouts are handled by Naano, so creators are paid automatically without your team doing the admin.",
  },
  {
    q: "What's the difference between Free and Done for you?",
    a: "Free gives you the infrastructure to run campaigns in-house at €0 per month. Done for you is a managed engagement where Naano handles strategy, sourcing, briefs, launch and reporting for a custom quote.",
  },
  {
    q: "Can I upgrade or cancel anytime?",
    a: "Yes. There is no lock-in, and campaign spend is always separate from the plan.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 className="font-display text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-ink sm:text-[3rem]">
              Frequently asked questions.
            </h2>
            <p className="mt-5 text-sm text-ink/55">
              Everything you need to know before getting started.
            </p>
            <p className="mt-6 text-[0.8125rem] text-ink/45">
              Still have questions?{" "}
              <Link
                href="#book"
                className="group inline-flex items-center gap-1 font-semibold text-ink"
              >
                Talk to our team
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </p>
          </div>

          <Accordion defaultValue={["item-0"]} className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold text-ink hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-ink/55">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
