import { cn } from "@/lib/utils";

/** Naano's mark: a soft swoosh with a dot, set next to the wordmark. */
export function NaanoLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 24"
        className="h-6 w-8 shrink-0"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M1 15.5C6.5 4 13 1.5 20.5 4.5c4 1.6 6.5 4.6 8.5 8-6-3.2-11-3-15 1-2.4 2.4-4 4.8-6.5 5.2C4.5 19.2 2 18 1 15.5Z"
          fill="currentColor"
        />
        <circle cx="27.5" cy="18" r="3.5" fill="var(--naano-blue)" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">
          naano
        </span>
      )}
    </span>
  );
}
