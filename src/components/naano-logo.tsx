import { cn } from "@/lib/utils";

/** Two offset wedges with a blue dot, traced from the mark in the recon
 *  screenshots. The lower wedge is the same shape rotated 180 degrees. */
const WEDGE =
  "M1 0H14C18.5 0 22 2.2 22 5C22 8.2 13.5 11 4 11H1C0.4 11 0 10.6 0 10V1C0 0.4 0.4 0 1 0Z";

export function NaanoLogo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
}: {
  className?: string;
  /** The mark renders larger in the site nav than in the auth screens. */
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 35 27"
        className={cn("h-[1.35rem] w-[1.75rem] shrink-0 xl:h-8 xl:w-[2.6rem]", markClassName)}
        aria-hidden="true"
        fill="none"
      >
        <path d={WEDGE} fill="currentColor" />
        <path d={WEDGE} fill="currentColor" transform="translate(31 23) rotate(180)" />
        <circle cx="32" cy="24" r="2.5" fill="var(--naano-blue)" />
      </svg>
      {showWordmark && (
        <span className={cn(
            "font-display text-[1.5rem] font-semibold tracking-tight xl:text-[2rem]",
            wordmarkClassName ?? "text-ink",
          )}>
          naano
        </span>
      )}
    </span>
  );
}
