"use client";

import { useActionState } from "react";
import { Globe } from "lucide-react";
import { analyzeWebsiteAction } from "@/app/actions/brand-onboarding";
import { FieldError, SubmitButton } from "@/components/auth/field";

export function BrandWebsiteForm({ defaultWebsite }: { defaultWebsite: string }) {
  const [state, formAction, pending] = useActionState(analyzeWebsiteAction, null);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <div>
        <label
          htmlFor="website"
          className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase"
        >
          Your website
        </label>
        <div className="relative mt-2">
          <Globe className="absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ink/35" />
          <input
            id="website"
            name="website"
            type="text"
            inputMode="url"
            placeholder="https://yourcompany.com"
            defaultValue={defaultWebsite}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pr-4 pl-11 text-[0.9375rem] text-ink shadow-[0_1px_2px_rgba(11,11,15,0.04)] outline-none transition-colors placeholder:text-ink/35 focus:border-naano-blue"
          />
        </div>
        <FieldError message={state?.error} />
      </div>

      <SubmitButton pending={pending}>Analyze my website</SubmitButton>
    </form>
  );
}
