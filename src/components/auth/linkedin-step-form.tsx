"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { saveLinkedInAction } from "@/app/actions/creator-onboarding";
import { FieldError, SubmitButton, TextField } from "@/components/auth/field";

export function LinkedInStepForm({ defaultUrl }: { defaultUrl: string }) {
  const [state, formAction, pending] = useActionState(saveLinkedInAction, null);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <TextField
        name="linkedinUrl"
        label="Public LinkedIn profile URL"
        type="url"
        placeholder="https://www.linkedin.com/in/you"
        defaultValue={defaultUrl}
      />
      <FieldError message={state?.error} />

      <div className="flex gap-3 rounded-xl bg-[#f4f7fd] p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-naano-blue" />
        <p className="text-[0.8125rem] leading-relaxed text-ink/60">
          By clicking below, you authorize Naano to read your public profile
          once: name, photo, headline, country and follower count. We do not
          import your posts, engagement or private analytics.
        </p>
      </div>

      <SubmitButton pending={pending}>Import my public profile</SubmitButton>
    </form>
  );
}
