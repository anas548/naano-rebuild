import { requireUser } from "@/lib/session";
import { ensureConversations, getThread, listConversations } from "@/lib/messaging";
import { MessagesView } from "@/components/messaging/messages-view";

export default async function BrandMessagesPage({
  searchParams,
}: PageProps<"/brand/messages">) {
  const user = await requireUser();
  await ensureConversations(user.id);

  const { thread: threadParam } = await searchParams;
  const conversations = await listConversations(user.id);
  const selectedId = typeof threadParam === "string" ? threadParam : conversations[0]?.id;
  const thread = selectedId ? await getThread(selectedId, user.id) : null;

  return (
    <MessagesView
      userId={user.id}
      viewerIsCreator={false}
      conversations={conversations}
      thread={thread}
      selectedId={selectedId}
      emptySubtitle="No conversations yet, invite a creator or accept an application - the thread opens with the booking."
    />
  );
}
