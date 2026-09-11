import { TriangleAlert } from "lucide-react";

/** The real product had LinkedIn import paused when the recon was captured, and
 *  it is stubbed that way here by agreement. */
export function LinkedInPausedNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <p className="flex gap-2.5 text-[0.875rem] leading-relaxed text-amber-900">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        LinkedIn import is temporarily paused. You can continue with a Basic
        card.
      </p>
      <button
        type="button"
        className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-amber-900 transition-colors hover:bg-amber-50"
      >
        Check the URL and try again
      </button>
    </div>
  );
}
