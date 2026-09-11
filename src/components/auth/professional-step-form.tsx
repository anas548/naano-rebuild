"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProfessionalAction } from "@/app/actions/creator-onboarding";
import { SubmitButton, TextField } from "@/components/auth/field";

export function ProfessionalStepForm() {
  const [state, formAction, pending] = useActionState(saveProfessionalAction, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="mt-7 space-y-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl bg-naano-blue py-3.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-naano-blue/90"
        >
          Complete now
        </button>
        <Link
          href="/signup/creator/card"
          className="block w-full rounded-xl border border-neutral-200 bg-white py-3.5 text-center text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-neutral-50"
        >
          Finish later
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <TextField
        name="businessName"
        label="Registered business name"
        placeholder="Your company or trading name"
      />
      <TextField
        name="businessRegistration"
        label="Registration number"
        placeholder="SIRET, VAT or company number"
      />
      {state?.error && (
        <p className="text-[0.8125rem] text-red-600">{state.error}</p>
      )}
      <SubmitButton pending={pending}>Save and continue</SubmitButton>
      <Link
        href="/signup/creator/card"
        className="block w-full rounded-xl border border-neutral-200 bg-white py-3.5 text-center text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-neutral-50"
      >
        Finish later
      </Link>
    </form>
  );
}
