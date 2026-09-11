"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { markConversationRead } from "@/lib/messaging";

export type SendState = { error?: string } | null;

export async function sendMessageAction(
  _prev: SendState,
  formData: FormData,
): Promise<SendState> {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return { error: "Write a message first." };
  if (body.length > 4000) return { error: "That message is too long." };

  // Membership check, so a conversation id alone is not enough to post into it.
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { id: user.id } } },
    select: { id: true },
  });
  if (!conversation) return { error: "Conversation not found." };

  await prisma.message.create({
    data: { conversationId, senderId: user.id, body },
  });

  revalidatePath("/creator/messages");
  revalidatePath("/brand/messages");
  return null;
}

/** Fired when a conversation is opened (see ConversationLink). Marking read
 *  also happens as a side effect of rendering the thread itself, so this is
 *  what's actually needed here is busting the *sidebar's* cached unread
 *  badge — layouts persist across a same-page ?thread= navigation and don't
 *  otherwise refetch, which is exactly the "doesn't update once opened" bug. */
export async function markConversationReadAction(conversationId: string) {
  const user = await requireUser();

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { id: user.id } } },
    select: { id: true },
  });
  if (!conversation) return;

  await markConversationRead(conversationId, user.id);

  revalidatePath("/creator/messages");
  revalidatePath("/brand/messages");
  revalidatePath("/creator", "layout");
  revalidatePath("/brand", "layout");
}
