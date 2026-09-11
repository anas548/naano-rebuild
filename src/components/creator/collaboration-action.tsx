"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import {
  acceptInvitationAction,
  declineInvitationAction,
  submitPostAction,
} from "@/app/actions/collaborations";

export function CollaborationAction({
  collaborationId,
  status,
  submittedLinkedinUrl,
}: {
  collaborationId: string;
  status: "INVITED" | "APPLIED" | "ACTIVE" | "NEEDS_ACTION" | "DECLINED" | "COMPLETED";
  /** The link already submitted, if any — lets the form act as "edit" too. */
  submittedLinkedinUrl: string | null;
}) {
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptInvitationAction, null);
  const [declineState, declineAction, declinePending] = useActionState(declineInvitationAction, null);
  const [postState, postAction, postPending] = useActionState(submitPostAction, null);
  const [editing, setEditing] = useState(false);
  const wasPending = useRef(false);

  // Collapse back to the "waiting for approval" view once a submit resolves
  // without an error, instead of leaving the edit form open.
  useEffect(() => {
    if (wasPending.current && !postPending && !postState?.error) setEditing(false);
    wasPending.current = postPending;
  }, [postPending, postState]);

  if (status === "INVITED") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex gap-2">
          <form action={declineAction}>
            <input type="hidden" name="collaborationId" value={collaborationId} />
            <button
              type="submit"
              disabled={declinePending || acceptPending}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-ink/60 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              <X className="size-3.5" />
              Decline
            </button>
          </form>
          <form action={acceptAction}>
            <input type="hidden" name="collaborationId" value={collaborationId} />
            <button
              type="submit"
              disabled={declinePending || acceptPending}
              className="flex items-center gap-1.5 rounded-full bg-naano-violet px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              {acceptPending ? "Accepting…" : "Accept"}
            </button>
          </form>
        </div>
        {(acceptState?.error || declineState?.error) && (
          <span className="max-w-[16rem] text-right text-[0.75rem] text-red-600">
            {acceptState?.error ?? declineState?.error}
          </span>
        )}
      </div>
    );
  }

  if (status === "ACTIVE") {
    if (submittedLinkedinUrl && !editing) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="text-[0.8125rem] text-ink/50">Waiting for approval</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[0.75rem] font-semibold text-naano-violet hover:underline"
          >
            Edit link
          </button>
        </div>
      );
    }

    return (
      <form action={postAction} className="flex flex-col items-end gap-1.5">
        <input type="hidden" name="collaborationId" value={collaborationId} />
        <div className="flex gap-2">
          <input
            type="text"
            name="linkedinUrl"
            defaultValue={submittedLinkedinUrl ?? ""}
            placeholder="linkedin.com/posts/…"
            className="w-48 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[0.8125rem] text-ink outline-none focus:border-naano-blue"
          />
          <button
            type="submit"
            disabled={postPending}
            className="rounded-full bg-naano-violet px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {postPending ? "Saving…" : "Submit"}
          </button>
        </div>
        {postState?.error && (
          <span className="text-[0.75rem] text-red-600">{postState.error}</span>
        )}
      </form>
    );
  }

  return <span className="text-ink/25">—</span>;
}
