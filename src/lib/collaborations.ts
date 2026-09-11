import type { CollaborationStatus } from "@/generated/prisma/enums";

export type CollabTab = {
  slug: string;
  label: string;
  statuses: CollaborationStatus[] | null; // null means "all"
};

/** An invitation sits under "Needs action" because the next move is the
 *  creator's, and the reference has no separate invitations tab. */
export const CREATOR_TABS: CollabTab[] = [
  { slug: "all", label: "All", statuses: null },
  { slug: "active", label: "Active", statuses: ["ACTIVE"] },
  { slug: "needs-action", label: "Needs action", statuses: ["NEEDS_ACTION", "INVITED"] },
  { slug: "applications-sent", label: "Applications sent", statuses: ["APPLIED"] },
  { slug: "declined", label: "Declined", statuses: ["DECLINED"] },
  { slug: "completed", label: "Completed", statuses: ["COMPLETED"] },
];

export function resolveTab(slug: string | undefined) {
  return CREATOR_TABS.find((t) => t.slug === slug) ?? CREATOR_TABS[0];
}

export const STATUS_STYLES: Record<CollaborationStatus, string> = {
  INVITED: "bg-[#ecf1ff] text-naano-violet",
  APPLIED: "bg-[#eef2f7] text-[#4d576b]",
  ACTIVE: "bg-[#e2faef] text-[#00834a]",
  NEEDS_ACTION: "bg-amber-50 text-amber-700",
  DECLINED: "bg-red-50 text-red-700",
  COMPLETED: "bg-[#eef2f7] text-[#4d576b]",
};

/** There's no separate enum state for "post submitted, awaiting brand
 *  approval" — an ACTIVE collaboration with a Post that has a link is that
 *  state. Keeping it derived (rather than adding a status) avoids a status
 *  whose meaning depends on which side is looking at it. */
export function submittedPost<T extends { linkedinUrl: string | null }>(
  posts: T[],
): T | undefined {
  return posts.find((p) => p.linkedinUrl);
}
