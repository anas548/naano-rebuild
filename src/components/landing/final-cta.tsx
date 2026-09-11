import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const INCLUDES = ["Creator strategy", "Campaign format", "Budget recommendation"];

export function FinalCta() {
  return (
    <section id="book" className="sky-rise py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/50 uppercase">
          Ready to launch?
        </p>
        <h2 className="mt-5 font-display text-4xl leading-[1.06] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
          Your next creator campaign starts here.
        </h2>
        <p className="mt-5 text-base text-ink/60">
          Get a clear creator strategy, campaign format and estimated budget for
          your next launch.
        </p>

        <div className="mx-auto mt-12 max-w-md rounded-[1.75rem] bg-white p-7 text-left shadow-[0_30px_70px_-25px_rgba(11,11,15,0.3)]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
            <span className="text-[0.625rem] font-semibold tracking-[0.16em] text-naano-blue uppercase">
              Campaign strategy call
            </span>
          </div>

          <h3 className="mt-4 font-display text-xl font-semibold text-ink">
            30-minute working session
          </h3>
          <p className="mt-2 text-[0.8125rem] text-ink/55">
            Leave with a concrete plan for your next creator campaign.
          </p>

          <ul className="mt-5">
            {INCLUDES.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 border-b border-neutral-100 py-3 text-sm text-ink/75 last:border-b-0"
              >
                <span className="size-1 rounded-full bg-naano-blue" />
                {item}
              </li>
            ))}
          </ul>

          <Button nativeButton={false} render={<Link href="/signup" />}
            className="group mt-6 w-full rounded-full bg-ink py-5 text-white hover:bg-ink/90">
              Book a campaign call
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          <p className="mt-2.5 text-center text-[0.75rem] text-ink/40">
            Pick a time on the next page.
          </p>
          <p className="mt-3 text-center text-[0.8125rem] text-ink/55">
            Prefer to start yourself?{" "}
            <Link href="/signup" className="font-semibold text-ink">
              Start for free →
            </Link>
          </p>
        </div>

        <p className="mt-8 text-[0.8125rem] text-ink/45">
          Trusted by B2B teams building creator-led acquisition.
        </p>
      </div>
    </section>
  );
}
