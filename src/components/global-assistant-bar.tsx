"use client";

import { AudioLines, ChevronUp, Sparkles } from "lucide-react";

/**
 * The floating "What would you like to do?" pill from every reference
 * screenshot — present on the landing page, auth flow, and both
 * dashboards alike, which is why it's mounted once from the root layout
 * rather than per-section.
 *
 * Presentational only, by explicit decision: the user has specific
 * functionality planned for this and will describe it before it's wired
 * up. Typing works (it would feel broken otherwise), but submitting does
 * nothing yet — there's deliberately no action behind it.
 */
export function GlobalAssistantBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="relative pointer-events-auto">
        <button
          type="button"
          aria-label="Expand"
          className="absolute -top-3 left-6 flex size-6 items-center justify-center rounded-full border border-[#e6e8ef] bg-white text-ink/50 shadow-sm transition-colors hover:text-ink"
        >
          <ChevronUp className="size-3.5" />
        </button>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-[min(92vw,26rem)] items-center gap-2 rounded-full border border-[#e6e8ef] bg-white/95 py-2 pr-2 pl-4 shadow-[0_16px_40px_-16px_rgba(11,11,15,0.35)] backdrop-blur"
        >
          <Sparkles className="size-4 shrink-0 text-ink/35" />
          <input
            type="text"
            placeholder="What would you like to do?"
            aria-label="What would you like to do?"
            className="min-w-0 flex-1 bg-transparent text-[0.875rem] text-ink outline-none placeholder:text-ink/40"
          />
          <button
            type="submit"
            aria-label="Ask"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-ink/50 transition-colors hover:bg-neutral-200 hover:text-ink"
          >
            <AudioLines className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
