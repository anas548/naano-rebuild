import { requireUser } from "@/lib/session";
import {
  ensureConversations,
  getThread,
  isConversationUnread,
  listConversations,
  markConversationRead,
} from "@/lib/messaging";
import { MessagesView } from "@/components/messaging/messages-view";

export default async function BrandMessagesPage({
  searchParams,
}: PageProps<"/brand/messages">) {
  const user = await requireUser();
  await ensureConversations(user.id);

  const { thread: threadParam } = await searchParams;
  const conversations = await listConversations(user.id);
  const selectedId = typeof threadParam === "string" ? threadParam : conversations[0]?.id;

  const unreadIds = new Set(
    conversations.filter((c) => isConversationUnread(c, user.id)).map((c) => c.id),
  );

  const thread = selectedId ? await getThread(selectedId, user.id) : null;
  if (selectedId && unreadIds.has(selectedId)) {
    await markConversationRead(selectedId, user.id);
    unreadIds.delete(selectedId);
  }

  return (
    <MessagesView
      userId={user.id}
      viewerIsCreator={false}
      conversations={conversations}
      thread={thread}
      selectedId={selectedId}
      unreadIds={unreadIds}
      emptySubtitle="No conversations yet, invite a creator or accept an application - the thread opens with the booking."
    />
  );
}
