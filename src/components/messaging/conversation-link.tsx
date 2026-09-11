"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markConversationReadAction } from "@/app/actions/messages";

/** A conversation row is a real Link (so it navigates, is bookmarkable, and
 *  keeps default anchor behaviour) that also fires a server action on every
 *  click. The page itself marks the thread read once it renders, but that
 *  alone leaves the sidebar's unread badge stale — layouts persist across a
 *  same-page ?thread= navigation and don't refetch on their own. This
 *  action's revalidatePath("layout") calls are what actually clear it, in
 *  the same click, without a full reload.
 *
 *  This always fires, even for a row this render already shows as read: the
 *  row can have been auto-selected (and marked read) by the very page load
 *  that's rendering it, in which case the sidebar badge was computed a
 *  moment earlier in that same navigation and hasn't caught up yet. Gating
 *  this on the row's `unread` prop would skip the one click that could fix
 *  that. The action itself is a cheap idempotent upsert either way. */
export function ConversationLink({
  href,
  conversationId,
  className,
  children,
}: {
  href: string;
  conversationId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [, startTransition] = useTransition();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        startTransition(() => {
          markConversationReadAction(conversationId);
        });
      }}
    >
      {children}
    </Link>
  );
}
