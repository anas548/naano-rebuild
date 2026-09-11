import { ArrowRight } from "lucide-react";

const LOGOS = ["lemlist", "folk.", "LEADBAY", "ringover", "attio"];

/** Customer logos under the hero. The real site uses SVG brand marks; these are
 *  wordmarks standing in for assets that aren't in the recon set. */
export function LogoWall() {
  return (
    <div className="mx-auto mt-12 w-full max-w-[1920px] px-5 sm:px-8 lg:px-12 xl:mt-16 2xl:px-16">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 xl:gap-x-16">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/70 py-2 pl-4 pr-2 ring-1 ring-white/60 backdrop-blur">
          <span className="text-base font-semibold text-ink xl:text-xl">BlogSEO</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.625rem] font-semibold tracking-[0.08em] text-ink/70 uppercase shadow-sm">
            Case study
            <ArrowRight className="size-3" />
          </span>
        </div>
        {LOGOS.map((name) => (
          <span
            key={name}
            className="text-xl font-semibold tracking-tight text-ink/55 xl:text-2xl"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
