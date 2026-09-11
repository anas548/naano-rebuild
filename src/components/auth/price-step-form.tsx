"use client";

import { useActionState, useState } from "react";
import { savePriceStepAction } from "@/app/actions/creator-onboarding";
import { FieldError, SubmitButton } from "@/components/auth/field";

export function PriceStepForm({ defaultPrice }: { defaultPrice: string }) {
  const [state, formAction, pending] = useActionState(savePriceStepAction, null);
  const [price, setPrice] = useState(defaultPrice || "220");

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-naano-blue uppercase">
          Set your price per post
        </p>
        <p className="mx-auto mt-3 max-w-[22rem] text-[0.875rem] leading-relaxed text-ink/55">
          We do not have enough data yet to make a reliable recommendation.
          Choose the rate that works for you.
        </p>

        <div className="mx-auto mt-5 flex max-w-[20rem] items-center justify-center gap-2 rounded-xl border-2 border-naano-blue px-5 py-4">
          <span className="font-display text-[2rem] font-semibold text-ink/60">
            €
          </span>
          <input
            name="pricePerPost"
            type="number"
            min={1}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label="Price per post in euros"
            className="w-[6.5rem] bg-transparent text-center font-display text-[2.5rem] font-semibold text-ink outline-none"
          />
          <span className="text-[0.9375rem] text-ink/50">/ post</span>
        </div>

        <p className="mx-auto mt-4 max-w-[24rem] text-[0.75rem] leading-relaxed text-ink/45">
          This is your net price per post. You can change it at any time from
          your Naano profile.
        </p>
      </div>

      <FieldError message={state?.error} />
      <SubmitButton pending={pending}>Create my marketplace profile</SubmitButton>

      <button
        type="button"
        className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-neutral-50"
      >
        Add a bundle (optional)
      </button>
    </form>
  );
}
