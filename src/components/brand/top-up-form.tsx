"use client";

import { useActionState } from "react";
import { topUpAction } from "@/app/actions/billing";

const PRESETS = [2500, 10000];

export function TopUpForm() {
  const [state, formAction, pending] = useActionState(topUpAction, null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <form action={formAction} className="flex items-center gap-2">
          <input
            type="number"
            name="amount"
            min="1"
            placeholder="Custom amount"
            className="w-36 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[0.875rem] text-ink outline-none placeholder:text-ink/35 focus:border-naano-blue"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-naano-violet px-5 py-2.5 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add budget"}
          </button>
        </form>

        {PRESETS.map((euros) => (
          <form key={euros} action={formAction}>
            <input type="hidden" name="amount" value={euros} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[0.875rem] font-semibold text-ink transition-colors hover:bg-neutral-50 disabled:opacity-60"
            >
              + €{euros.toLocaleString()}
            </button>
          </form>
        ))}
      </div>
      {state?.error && <p className="mt-2 text-[0.8125rem] text-red-600">{state.error}</p>}
    </div>
  );
}
