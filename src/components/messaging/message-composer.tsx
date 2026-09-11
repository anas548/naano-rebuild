"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendMessageAction } from "@/app/actions/messages";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [state, formAction, pending] = useActionState(sendMessageAction, null);
  const ref = useRef<HTMLFormElement>(null);

  // React 19 clears the form on a successful action; only reset on failure.
  useEffect(() => {
    if (!pending && !state?.error) ref.current?.reset();
  }, [pending, state]);

  return (
    <form ref={ref} action={formAction} className="border-t border-[#e6e8ef] p-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      <div className="flex items-center gap-3">
        <input
          name="body"
          autoComplete="off"
          placeholder="Write a message…"
          aria-label="Write a message"
          className="flex-1 rounded-xl border border-[#e6e8ef] px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-naano-violet"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-naano-violet text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </div>
      {state?.error && (
        <p className="mt-2 text-[0.8125rem] text-red-600">{state.error}</p>
      )}
    </form>
  );
}
