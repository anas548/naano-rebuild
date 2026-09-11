import "server-only";
import { prisma } from "@/lib/prisma";

const BOT_GREETING = "A question or need help? Start here.";

/** A thread exists per live collaboration, with both sides as participants, so
 *  the brand reads the same conversation from its own dashboard. Declined deals
 *  do not get one. */
export async function ensureConversations(userId: string) {
  const collaborations = await prisma.collaboration.findMany({
    where: {
      status: { not: "DECLINED" },
      OR: [
        { creator: { userId } },
        { campaign: { brand: { userId } } },
      ],
      conversation: null,
    },
    select: {
      id: true,
      creator: { select: { userId: true } },
      campaign: { select: { brand: { select: { userId: true } } } },
    },
  });

  for (const collaboration of collaborations) {
    await prisma.conversation.create({
      data: {
        collaborationId: collaboration.id,
        participants: {
          connect: [
            { id: collaboration.creator.userId },
            { id: collaboration.campaign.brand.userId },
          ],
        },
      },
    });
  }

  const bot = await prisma.conversation.findFirst({
    where: { isSystem: true, participants: { some: { id: userId } } },
    select: { id: true },
  });

  if (!bot) {
    await prisma.conversation.create({
      data: {
        isSystem: true,
        participants: { connect: { id: userId } },
        messages: { create: { body: BOT_GREETING } },
      },
    });
  }
}

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { participants: { some: { id: userId } } },
    orderBy: { createdAt: "desc" },
    include: {
      collaboration: {
        include: {
          campaign: { include: { brand: { select: { name: true } } } },
          creator: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      reads: { where: { userId }, select: { lastReadAt: true } },
    },
  });
}

/** Unread means: the latest message is newer than this viewer's last-read
 *  mark (or there is no mark at all), and it wasn't the viewer's own message
 *  — sending the last word in a thread doesn't leave it unread for you.
 *  Takes a minimal structural shape rather than listConversations' full
 *  return type, so the lean count query below doesn't need every join. */
export function isConversationUnread(
  conversation: {
    messages: { createdAt: Date; senderId: string | null }[];
    reads: { lastReadAt: Date }[];
  },
  userId: string,
) {
  const last = conversation.messages[0];
  if (!last || last.senderId === userId) return false;
  const lastReadAt = conversation.reads[0]?.lastReadAt;
  return !lastReadAt || last.createdAt > lastReadAt;
}

/** Lean count for the sidebar badge — no campaign/brand/creator joins. */
export async function countUnreadConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { id: userId } } },
    select: {
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true, senderId: true } },
      reads: { where: { userId }, select: { lastReadAt: true } },
    },
  });
  return conversations.filter((c) => isConversationUnread(c, userId)).length;
}

/** Marks a thread read for this viewer. Idempotent, safe to call whenever a
 *  thread is displayed — from the page itself (a plain visit/refresh) and
 *  from the explicit mark-read action a click fires (see actions/messages.ts). */
export async function markConversationRead(conversationId: string, userId: string) {
  await prisma.conversationRead.upsert({
    where: { conversationId_userId: { conversationId, userId } },
    update: { lastReadAt: new Date() },
    create: { conversationId, userId },
  });
}

export async function getThread(conversationId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { id: userId } } },
    include: {
      collaboration: {
        include: {
          campaign: { include: { brand: { select: { name: true } } } },
          creator: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, firstName: true } } },
      },
    },
  });
}

/** What the other side of a thread is called, from this user's point of view.
 *  Minimal structural shape so it accepts both listConversations rows and a
 *  getThread result (which doesn't select `reads`). */
export function counterpartName(
  conversation: {
    isSystem: boolean;
    collaboration: {
      campaign: { brand: { name: string | null } };
      creator: { user: { firstName: string; lastName: string } };
    } | null;
  },
  viewerIsCreator: boolean,
) {
  if (conversation.isSystem) return "NaanoBot";
  const collaboration = conversation.collaboration;
  if (!collaboration) return "Conversation";
  return viewerIsCreator
    ? (collaboration.campaign.brand.name ?? "Brand")
    : `${collaboration.creator.user.firstName} ${collaboration.creator.user.lastName}`;
}
