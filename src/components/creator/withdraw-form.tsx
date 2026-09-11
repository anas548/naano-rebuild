"use client";

import { useActionState, useRef } from "react";
import { Building2, Check, CreditCard } from "lucide-react";
import { withdrawAction } from "@/app/actions/withdrawals";
import { formatEuros } from "@/lib/pricing";

export function WithdrawForm({ availableCents }: { availableCents: number }) {
  const [state, formAction, pending] = useActionState(withdrawAction, null);
  const amountRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction}>
      <p className="mt-5 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/50 uppercase">
        Payout method
      </p>

      <div className="mt-3 space-y-3">
        <label className="flex cursor-not-allowed gap-3 rounded-xl border border-[#e6e8ef] p-4">
          <input type="radio" name="method" disabled className="mt-1" />
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-[0.875rem] font-semibold text-ink">
              <Building2 className="size-4 text-ink/50" />
              Bank transfer
            </span>
            <span className="mt-1 block text-[0.8125rem] text-ink/50">
              No account holder on file
            </span>
            <span className="block text-[0.8125rem] text-ink/50">
              No bank details on file
            </span>
          </span>
        </label>

        <label className="flex gap-3 rounded-xl border-2 border-naano-violet bg-[#faf8ff] p-4">
          <input type="radio" name="method" value="STRIPE" defaultChecked className="mt-1" />
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-[0.875rem] font-semibold text-ink">
              <CreditCard className="size-4 text-naano-violet" />
              Stripe
            </span>
            <span className="mt-1 block text-[0.8125rem] text-ink/50">
              Status: Connected on first withdrawal (demo)
            </span>
            <span className="block text-[0.8125rem] text-ink/50">
              Instant transfer to your connected Stripe account.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[0.875rem] text-ink/40">
            €
          </span>
          <input
            ref={amountRef}
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            disabled={availableCents === 0 || pending}
            className="w-full rounded-xl border border-[#e6e8ef] py-2.5 pr-4 pl-8 text-[0.875rem] text-ink outline-none placeholder:text-ink/35 focus:border-naano-violet disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-ink/35"
          />
        </div>
        <button
          type="button"
          disabled={availableCents === 0 || pending}
          onClick={() => {
            if (amountRef.current) amountRef.current.value = String(availableCents / 100);
          }}
          className="rounded-xl border border-[#e6e8ef] px-4 py-2.5 text-[0.875rem] text-ink/70 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-ink/35 disabled:hover:bg-transparent"
        >
          Withdraw all
        </button>
      </div>

      <button
        type="submit"
        disabled={availableCents === 0 || pending}
        className="mt-3 w-full rounded-xl bg-naano-violet py-3 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Confirming…" : "Confirm withdrawal"}
      </button>

      {state?.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[0.8125rem] text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#e2faef] px-4 py-3 text-[0.8125rem] text-[#00834a]">
          <Check className="size-4 shrink-0" />
          Withdrawal confirmed — sent to your connected Stripe account.
        </p>
      )}

      {availableCents === 0 && !state?.success && (
        <p className="mt-3 rounded-xl bg-neutral-50 px-4 py-3 text-[0.8125rem] text-ink/55">
          Nothing available to withdraw yet.
        </p>
      )}
      {availableCents > 0 && (
        <p className="mt-3 text-[0.75rem] text-ink/40">
          Up to {formatEuros(availableCents)} available.
        </p>
      )}
    </form>
  );
}
