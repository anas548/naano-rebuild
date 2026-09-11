import type { CollaborationStatus } from "@/generated/prisma/enums";
import { submittedPost } from "@/lib/collaborations";

type Row = { status: CollaborationStatus; posts: { linkedinUrl: string | null }[] };

export type BrandCollabTab = {
  slug: string;
  label: string;
  match: (row: Row) => boolean;
};

/** Mirrors the creator's tab shape but from the brand's side: "Invitations
 *  received" are creator-initiated applications waiting on the brand,
 *  "Invitations sent" are the brand's own invites waiting on the creator,
 *  and "To do" is whatever genuinely needs the brand's attention right now -
 *  an application to decide on, or a submitted post to approve. */
export const BRAND_COLLAB_TABS: BrandCollabTab[] = [
  { slug: "all", label: "All", match: () => true },
  { slug: "active", label: "Active", match: (r) => r.status === "ACTIVE" },
  { slug: "invitations-received", label: "Invitations received", match: (r) => r.status === "APPLIED" },
  { slug: "invitations-sent", label: "Invitations sent", match: (r) => r.status === "INVITED" },
  {
    slug: "to-do",
    label: "To do",
    match: (r) =>
      r.status === "APPLIED" || (r.status === "ACTIVE" && Boolean(submittedPost(r.posts))),
  },
  { slug: "completed", label: "Completed", match: (r) => r.status === "COMPLETED" },
];

export function resolveBrandTab(slug: string | undefined) {
  return BRAND_COLLAB_TABS.find((t) => t.slug === slug) ?? BRAND_COLLAB_TABS[0];
}
