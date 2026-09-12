"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AudioLines, ChevronDown, ChevronUp, LoaderCircle, Sparkles } from "lucide-react";
import { askAssistantAction } from "@/app/actions/assistant";
import { useAssistantContext } from "@/components/assistant/assistant-context";
import { cn } from "@/lib/utils";

/**
 * The floating "What would you like to do?" bar from every reference
 * screenshot, mounted once in the root layout so it's on every page. Real
 * now: single-turn (no history kept — every question is answered fresh),
 * one OpenAI call per submit. On /creator/opportunities every question is
 * treated as "which opportunity fits me best" and also writes a ranking to
 * AssistantContext so that page can highlight the matching cards; every
 * other page gets the plain basic-info chatbot. See src/lib/assistant.ts.
 */
export function GlobalAssistantBar() {
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(askAssistantAction, null);
  const { setOpportunityRanking } = useAssistantContext();
  // Whether the user has explicitly collapsed the panel since the last
  // submit — reset in the submit handler (a real event, not an effect), so
  // every new question reopens it and it stays open once the answer lands.
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const wasPending = useRef(false);

  // When a ranking comes back on the Opportunities page, hand it to the
  // shared context so the page can highlight/reorder its cards.
  useEffect(() => {
    const justFinished = wasPending.current && !pending;
    wasPending.current = pending;
    if (justFinished && state?.ranking && state.ranking.length > 0) {
      setOpportunityRanking({ picks: state.ranking, summary: state.answer ?? "" });
    }
  }, [pending, state, setOpportunityRanking]);

  // A stale ranking shouldn't linger once you've left Opportunities.
  useEffect(() => {
    if (pathname !== "/creator/opportunities") setOpportunityRanking(null);
  }, [pathname, setOpportunityRanking]);

  const hasContent = pending || state?.answer || state?.error;
  const panelOpen = hasContent && !manuallyClosed;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="relative pointer-events-auto">
        {panelOpen && (
          <div className="absolute bottom-full left-0 mb-3 w-[min(92vw,26rem)] rounded-2xl border border-[#e6e8ef] bg-white p-4 text-left shadow-[0_16px_40px_-16px_rgba(11,11,15,0.35)]">
            {state?.query && (
              <p className="text-[0.8125rem] font-semibold text-ink">{state.query}</p>
            )}
            <div className="mt-2">
              {pending ? (
                <p className="flex items-center gap-2 text-[0.8125rem] text-ink/50">
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Thinking…
                </p>
              ) : state?.error ? (
                <p className="text-[0.8125rem] text-red-600">{state.error}</p>
              ) : (
                <p className="text-[0.8125rem] leading-relaxed text-ink/70">{state?.answer}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          aria-label={panelOpen ? "Collapse" : "Expand"}
          onClick={() => setManuallyClosed((v) => !v)}
          disabled={!hasContent}
          className="absolute -top-3 left-6 z-10 flex size-6 items-center justify-center rounded-full border border-[#e6e8ef] bg-white text-ink/50 shadow-sm transition-colors hover:text-ink disabled:cursor-default disabled:opacity-60"
        >
          {panelOpen ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </button>

        <form
          action={formAction}
          onSubmit={() => setManuallyClosed(false)}
          className="flex w-[min(92vw,26rem)] items-center gap-2 rounded-full border border-[#e6e8ef] bg-white/95 py-2 pr-2 pl-4 shadow-[0_16px_40px_-16px_rgba(11,11,15,0.35)] backdrop-blur"
        >
          <input type="hidden" name="pathname" value={pathname} />
          <Sparkles className={cn("size-4 shrink-0", pending ? "animate-pulse text-naano-violet" : "text-ink/35")} />
          <input
            type="text"
            name="query"
            placeholder={
              pathname === "/creator/opportunities"
                ? "Which opportunity has the best chance for me?"
                : "What would you like to do?"
            }
            aria-label="What would you like to do?"
            className="min-w-0 flex-1 bg-transparent text-[0.875rem] text-ink outline-none placeholder:text-ink/40"
          />
          <button
            type="submit"
            disabled={pending}
            aria-label="Ask"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-ink/50 transition-colors hover:bg-neutral-200 hover:text-ink disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <AudioLines className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
