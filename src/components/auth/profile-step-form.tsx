"use client";

import { useActionState, useState } from "react";
import { saveProfileStepAction } from "@/app/actions/creator-onboarding";
import { FieldError, SubmitButton } from "@/components/auth/field";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

const MAX = 3;

export function ProfileStepForm({
  industries,
  defaultCountry,
  defaultIndustryIds,
}: {
  industries: { id: string; label: string }[];
  defaultCountry: string;
  defaultIndustryIds: string[];
}) {
  const [state, formAction, pending] = useActionState(saveProfileStepAction, null);
  const [selected, setSelected] = useState<string[]>(defaultIndustryIds);

  return (
    <form action={formAction} className="mt-7 space-y-6">
      <div>
        <label htmlFor="country" className="font-display text-[1.0625rem] font-semibold text-ink">
          Your country
        </label>
        <p className="mt-1 text-[0.8125rem] text-ink/50">
          Confirm your country before continuing.
        </p>
        <select
          id="country"
          name="country"
          defaultValue={defaultCountry}
          className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] text-ink outline-none focus:border-naano-blue"
        >
          <option value="">Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="font-display text-[1.0625rem] font-semibold text-ink">
          Your industries{" "}
          <span className="text-[0.875rem] font-normal text-ink/50">
            (pick up to {MAX})
          </span>
        </span>
        <p className="mt-1 text-[0.8125rem] text-ink/50">
          Choose up to {MAX} industries to help relevant brands find your card.
        </p>
        {selected.map((id) => (
          <input key={id} type="hidden" name="industryIds" value={id} />
        ))}
        <div className="mt-3 flex max-h-[13rem] flex-wrap gap-2 overflow-y-auto pr-1">
          {industries.map((industry) => {
            const on = selected.includes(industry.id);
            const full = selected.length >= MAX && !on;
            return (
              <button
                key={industry.id}
                type="button"
                disabled={full}
                aria-pressed={on}
                onClick={() =>
                  setSelected((c) =>
                    on ? c.filter((i) => i !== industry.id) : [...c, industry.id],
                  )
                }
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors",
                  on
                    ? "border-naano-blue bg-naano-blue text-white"
                    : full
                      ? "border-neutral-200 bg-white text-ink/25"
                      : "border-neutral-200 bg-white text-ink/70 hover:border-neutral-300",
                )}
              >
                {industry.label}
              </button>
            );
          })}
        </div>
      </div>

      <FieldError message={state?.error} />
      <SubmitButton pending={pending}>Continue</SubmitButton>
    </form>
  );
}
