import { NaanoLogo } from "@/components/naano-logo";
import { LinkedInIcon } from "@/components/landing/icons";

const STATS = ["Followers", "Est. impressions", "Cost / post"];

/** The creator card as it looks before any profile data exists: everything
 *  pending, which is the state the signup flow starts from. */
export function MarketplaceCardPreview() {
  return (
    <div className="mx-auto w-full max-w-[495px] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_60px_-20px_rgba(11,11,15,0.25)]">
      <div className="relative flex min-h-[7.75rem] items-center justify-center overflow-hidden bg-gradient-to-br from-naano-blue to-[#4f7bf5] px-5 pb-8">
        {/* faint disc in the corner, as on the real card */}
        <span className="absolute -top-10 -right-10 size-32 rounded-full bg-white/[0.07]" />
        <span className="absolute top-5 left-5 flex size-11 items-center justify-center rounded-xl bg-white/95 shadow-sm">
          <LinkedInIcon className="size-6" />
        </span>
        <NaanoLogo
          className="text-white"
          wordmarkClassName="text-white"
          markClassName="h-[1.15rem] w-[1.5rem] xl:h-[1.15rem] xl:w-[1.5rem]"
        />
      </div>

      <div className="relative -mt-[2.65rem] px-7 text-center">
        <div className="mx-auto flex size-[5.3rem] items-center justify-center rounded-full bg-neutral-100 ring-[5px] ring-white">
          <span className="font-display text-[1.75rem] font-semibold text-ink/25">
            Y
          </span>
        </div>

        <h3 className="mt-4 font-display text-[1.625rem] font-semibold tracking-tight text-ink">
          Your name
        </h3>
        <p className="mt-3 text-[0.875rem] text-ink/50">
          Your LinkedIn headline and topics will appear here.
        </p>

        <div className="mt-6 mb-5 flex items-center gap-4">
          <span className="text-[0.8125rem] text-ink/45">Data</span>
          <span className="h-1.5 flex-1 rounded-full bg-neutral-100" />
          <span className="text-[0.8125rem] text-ink/45">Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100">
        {STATS.map((label) => (
          <div key={label} className="px-2 py-6 text-center">
            <div className="font-display text-xl leading-none font-bold text-ink/80">
              —
            </div>
            <div className="mt-2.5 text-[0.75rem] whitespace-nowrap text-ink/45">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
