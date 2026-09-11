"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { applyToCampaignAction } from "@/app/actions/opportunities";

export function ApplyButton({
  campaignId,
  disabledReason,
}: {
  campaignId: string;
  disabledReason?: string;
}) {
  const [state, formAction, pending] = useActionState(
    applyToCampaignAction,
    null,
  );

  if (state?.applied) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2faef] px-4 py-2 text-[0.8125rem] font-semibold text-[#00834a]">
        <Check className="size-4" />
        Applied
      </span>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="campaignId" value={campaignId} />
      <button
        type="submit"
        disabled={pending || Boolean(disabledReason)}
        title={disabledReason}
        className="rounded-full bg-naano-violet px-5 py-2 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Applying…" : "Apply"}
      </button>
      {state?.error && (
        <span className="text-[0.75rem] text-red-600">{state.error}</span>
      )}
    </form>
  );
}
