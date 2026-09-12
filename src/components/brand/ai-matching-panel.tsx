"use client";

import { useActionState, useRef } from "react";
import { ArrowUp, Cloud, LoaderCircle } from "lucide-react";
import { matchCreatorsAction } from "@/app/actions/ai-matching";
import { MarketplaceCreatorCard } from "@/components/brand/marketplace-creator-card";

/** Real, per agreed scope: the brand's profile + the real Marketplace pool
 *  go to an OpenAI model, which returns a grounded, reasoned shortlist —
 *  rendered as the same real Marketplace cards, Add and all. */
export function AiMatchingPanel({
  brandName,
  suggestions,
}: {
  brandName: string;
  suggestions: string[];
}) {
  const [state, formAction, pending] = useActionState(matchCreatorsAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function askAbout(query: string) {
    if (inputRef.current) inputRef.current.value = query;
    formRef.current?.requestSubmit();
  }

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#eef1fd]">
        <Cloud className="size-7 text-naano-violet" />
      </span>
      <h2 className="mt-6 font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Hey {brandName}, let&apos;s find the right creators for you.
      </h2>

      <form
        ref={formRef}
        action={formAction}
        className="mt-7 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-[#e6e8ef] bg-white p-2 pl-5 shadow-sm"
      >
        <input
          ref={inputRef}
          type="text"
          name="query"
          defaultValue={state?.query}
          placeholder="Find 4 creators for your campaign brief. Prioritize strong audience and content fit."
          className="flex-1 bg-transparent text-[0.875rem] text-ink outline-none placeholder:text-ink/40"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Ask Nao"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-naano-violet text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </button>
      </form>

      {pending && (
        <p className="mt-3 flex items-center gap-2 text-[0.8125rem] text-ink/50">
          <LoaderCircle className="size-3.5 animate-spin" />
          Reading your brief and scanning the Marketplace…
        </p>
      )}
      {!pending && state?.error && (
        <p className="mt-3 text-[0.8125rem] text-red-600">{state.error}</p>
      )}

      {!pending && state?.picks && state.picks.length > 0 && (
        <div className="mt-8 w-full max-w-5xl text-left">
          <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/40 uppercase">
            {state.picks.length} match{state.picks.length === 1 ? "" : "es"} for &quot;{state.query}&quot;
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {state.picks.map(({ creator, reason, campaigns, alreadyLinked }) => (
              <MarketplaceCreatorCard
                key={creator.id}
                creator={creator}
                reason={reason}
                campaigns={campaigns}
                alreadyLinked={alreadyLinked}
              />
            ))}
          </div>
        </div>
      )}

      {!pending && !state?.picks && (
        <div className="mt-8 w-full max-w-2xl text-left">
          <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/40 uppercase">
            Suggested for you
          </p>
          <div className="mt-2 divide-y divide-neutral-100 rounded-xl border border-[#e6e8ef] bg-white">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => askAbout(s)}
                className="block w-full px-4 py-3.5 text-left text-[0.875rem] text-ink/70 transition-colors hover:bg-neutral-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
