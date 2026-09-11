import Link from "next/link";
import { Search } from "lucide-react";
import type { getThread, listConversations } from "@/lib/messaging";
import { counterpartName } from "@/lib/messaging";
import { MessageComposer } from "@/components/messaging/message-composer";
import { cn } from "@/lib/utils";

type Conversations = Awaited<ReturnType<typeof listConversations>>;
type Thread = NonNullable<Awaited<ReturnType<typeof getThread>>>;

function timeLabel(date: Date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Shared between the creator and brand inboxes — same Conversation rows,
 *  same layout, just a different `viewerIsCreator` flag for whose name to
 *  show as the counterpart and which id counts as "mine" in a bubble. */
export function MessagesView({
  userId,
  viewerIsCreator,
  conversations,
  thread,
  selectedId,
  emptySubtitle,
}: {
  userId: string;
  viewerIsCreator: boolean;
  conversations: Conversations;
  thread: Thread | null;
  selectedId: string | undefined;
  emptySubtitle: string;
}) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="grid h-[calc(100vh-9rem)] overflow-hidden rounded-xl border border-[#e6e8ef] bg-white lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-[#e6e8ef]">
          <div className="p-5">
            <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">
              Messages
            </h1>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e6e8ef] px-3 py-2.5">
              <Search className="size-4 text-ink/35" />
              <span className="text-[0.875rem] text-ink/35">
                Search conversations
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {conversations.map((conversation) => {
              const name = counterpartName(conversation, viewerIsCreator);
              const last = conversation.messages[0];
              const active = conversation.id === selectedId;

              return (
                <Link
                  key={conversation.id}
                  href={`?thread=${conversation.id}`}
                  className={cn(
                    "flex gap-3 px-5 py-3.5 transition-colors",
                    active ? "bg-[#faf8ff]" : "hover:bg-neutral-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full font-display text-[0.875rem] font-semibold text-white",
                      conversation.isSystem ? "bg-ink" : "bg-[#dd005c]",
                    )}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[0.875rem] font-semibold text-ink">
                        {name}
                      </span>
                      {last && (
                        <span className="shrink-0 text-[0.6875rem] text-ink/40">
                          {timeLabel(last.createdAt)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.8125rem] text-ink/50">
                      {last?.body ??
                        (conversation.collaboration
                          ? conversation.collaboration.campaign.name
                          : "No messages yet")}
                    </span>
                  </span>
                </Link>
              );
            })}

            {conversations.length === 0 && (
              <p className="px-5 text-[0.8125rem] leading-relaxed text-ink/50">
                {emptySubtitle}
              </p>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="border-b border-[#e6e8ef] px-6 py-4">
            <p className="text-[0.9375rem] font-semibold text-ink">
              {thread ? counterpartName(thread, viewerIsCreator) : "Messages"}
            </p>
            <p className="text-[0.8125rem] text-ink/50">
              {thread?.collaboration ? thread.collaboration.campaign.name : "Select a conversation"}
            </p>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-6">
            {!thread ? (
              <p className="pt-16 text-center text-[0.875rem] text-ink/50">
                No conversations yet.
              </p>
            ) : thread.messages.length === 0 ? (
              <p className="pt-16 text-center text-[0.875rem] text-ink/50">
                No messages yet. Say hello.
              </p>
            ) : (
              thread.messages.map((message) => {
                const mine = message.sender?.id === userId;
                return (
                  <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[32rem] rounded-2xl px-4 py-2.5 text-[0.875rem] leading-relaxed",
                        mine ? "bg-naano-violet text-white" : "bg-neutral-100 text-ink",
                      )}
                    >
                      {message.body}
                      <span
                        className={cn(
                          "mt-1 block text-[0.6875rem]",
                          mine ? "text-white/60" : "text-ink/40",
                        )}
                      >
                        {message.sender?.firstName ?? "NaanoBot"} · {timeLabel(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {thread && <MessageComposer conversationId={thread.id} />}
        </section>
      </div>
    </div>
  );
}
