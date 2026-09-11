import { ArrowRight } from "lucide-react";

const LOGOS = ["lemlist", "folk.", "LEADBAY", "ringover", "attio"];

/** Customer logos under the hero. The real site uses SVG brand marks; these are
 *  wordmarks standing in for assets that aren't in the recon set. */
export function LogoWall() {
  return (
    <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/70 py-2 pl-4 pr-2 ring-1 ring-white/60 backdrop-blur">
          <span className="text-sm font-semibold text-ink">BlogSEO</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.625rem] font-semibold tracking-[0.08em] text-ink/70 uppercase shadow-sm">
            Case study
            <ArrowRight className="size-3" />
          </span>
        </div>
        {LOGOS.map((name) => (
          <span
            key={name}
            className="text-lg font-semibold tracking-tight text-ink/55"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
