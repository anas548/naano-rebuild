"use client";

import { useActionState } from "react";
import { createCampaignAction, updateCampaignAction } from "@/app/actions/campaigns";
import { FieldError, LABEL, SubmitButton, TextField } from "@/components/auth/field";

type Defaults = {
  campaignId?: string;
  name?: string;
  briefProduct?: string;
  briefAudience?: string;
  committedBudget?: string;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED";
  openToApplications?: boolean;
};

/** Create uses two submit buttons (draft vs launch); edit is a single save
 *  with an explicit status select, since a live campaign can also be paused
 *  or marked complete later. */
export function CampaignForm({ mode, defaults }: { mode: "create" | "edit"; defaults?: Defaults }) {
  const action = mode === "create" ? createCampaignAction : updateCampaignAction;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && (
        <input type="hidden" name="campaignId" value={defaults?.campaignId} />
      )}

      <TextField
        name="name"
        label="Campaign name"
        placeholder="e.g. Outbound that gets replies"
        defaultValue={defaults?.name}
      />

      <div>
        <label htmlFor="briefProduct" className={LABEL}>
          What the creator posts about
        </label>
        <textarea
          id="briefProduct"
          name="briefProduct"
          rows={4}
          placeholder="The product, angle and any claims creators can use."
          defaultValue={defaults?.briefProduct}
          className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.875rem] leading-relaxed text-ink outline-none transition-colors focus:border-naano-blue"
        />
      </div>

      <div>
        <label htmlFor="briefAudience" className={LABEL}>
          Audience <span className="font-normal normal-case text-ink/40">(optional)</span>
        </label>
        <input
          id="briefAudience"
          name="briefAudience"
          placeholder="e.g. RevOps managers · Sales leaders"
          defaultValue={defaults?.briefAudience}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-naano-blue"
        />
      </div>

      <TextField
        name="committedBudget"
        label="Committed budget (EUR)"
        type="number"
        min="0"
        step="1"
        placeholder="0"
        defaultValue={defaults?.committedBudget}
      />

      {mode === "edit" && (
        <>
          <div>
            <label htmlFor="status" className={LABEL}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={defaults?.status ?? "ACTIVE"}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] text-ink outline-none focus:border-naano-blue"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 text-[0.875rem] text-ink/70">
            <input
              type="checkbox"
              name="openToApplications"
              defaultChecked={defaults?.openToApplications}
              className="size-4 rounded border-neutral-300 text-naano-violet focus:ring-naano-violet"
            />
            Open to creator applications on Opportunities
          </label>
        </>
      )}

      <FieldError message={state?.error} />

      {mode === "create" ? (
        <div className="flex gap-3">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-3.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            Save as draft
          </button>
          <button
            type="submit"
            name="intent"
            value="launch"
            disabled={pending}
            className="flex-1 rounded-xl bg-naano-violet py-3.5 text-[0.9375rem] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
          >
            Launch campaign
          </button>
        </div>
      ) : (
        <SubmitButton pending={pending}>Save changes</SubmitButton>
      )}
    </form>
  );
}
