"use client";

import { useState } from "react";
import { ArrowUp, Cloud } from "lucide-react";

/** Static per agreed scope — no model behind this yet. Typing and submitting
 *  are honest about that instead of faking a response. */
export function AiMatchingStatic({
  brandName,
  suggestions,
}: {
  brandName: string;
  suggestions: string[];
}) {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#eef1fd]">
        <Cloud className="size-7 text-naano-violet" />
      </span>
      <h2 className="mt-6 font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Hey {brandName}, let&apos;s find the right creators for you.
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowNotice(true);
        }}
        className="mt-7 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-[#e6e8ef] bg-white p-2 pl-5 shadow-sm"
      >
        <input
          type="text"
          placeholder="Find 4 creators for your campaign brief. Prioritize strong audience and content fit."
          className="flex-1 bg-transparent text-[0.875rem] text-ink outline-none placeholder:text-ink/40"
        />
        <button
          type="submit"
          aria-label="Ask Nao"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-naano-violet text-white transition-opacity hover:opacity-90"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>

      {showNotice && (
        <p className="mt-3 text-[0.8125rem] text-ink/50">
          AI Matching isn&apos;t wired up in this clone yet — try the Creator
          Marketplace tab to invite real creators.
        </p>
      )}

      <div className="mt-8 w-full max-w-2xl text-left">
        <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/40 uppercase">
          Suggested for you
        </p>
        <div className="mt-2 divide-y divide-neutral-100 rounded-xl border border-[#e6e8ef] bg-white">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShowNotice(true)}
              className="block w-full px-4 py-3.5 text-left text-[0.875rem] text-ink/70 transition-colors hover:bg-neutral-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
