"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import {
  acceptApplicationAction,
  approvePostAction,
  declineApplicationAction,
} from "@/app/actions/collaborations";

export function BrandCollaborationAction({
  collaborationId,
  status,
  submittedLinkedinUrl,
}: {
  collaborationId: string;
  status: "INVITED" | "APPLIED" | "ACTIVE" | "NEEDS_ACTION" | "DECLINED" | "COMPLETED";
  submittedLinkedinUrl: string | null;
}) {
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptApplicationAction, null);
  const [declineState, declineAction, declinePending] = useActionState(declineApplicationAction, null);
  const [approveState, approveAction, approvePending] = useActionState(approvePostAction, null);

  if (status === "APPLIED") {
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
            {acceptState?.error && (
              <>
                {" "}
                <Link href="/brand/billing" className="underline">
                  Top up
                </Link>
              </>
            )}
          </span>
        )}
      </div>
    );
  }

  if (status === "ACTIVE" && submittedLinkedinUrl) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <a
            href={submittedLinkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[0.75rem] font-semibold text-naano-violet hover:underline"
          >
            View post
          </a>
          <form action={approveAction}>
            <input type="hidden" name="collaborationId" value={collaborationId} />
            <button
              type="submit"
              disabled={approvePending}
              className="flex items-center gap-1.5 rounded-full bg-naano-violet px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              {approvePending ? "Approving…" : "Approve"}
            </button>
          </form>
        </div>
        {approveState?.error && (
          <span className="text-[0.75rem] text-red-600">{approveState.error}</span>
        )}
      </div>
    );
  }

  return <span className="text-ink/25">—</span>;
}
