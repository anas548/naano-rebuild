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
    },
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

/** What the other side of a thread is called, from this user's point of view. */
export function counterpartName(
  conversation: Awaited<ReturnType<typeof listConversations>>[number],
  viewerIsCreator: boolean,
) {
  if (conversation.isSystem) return "NaanoBot";
  const collaboration = conversation.collaboration;
  if (!collaboration) return "Conversation";
  return viewerIsCreator
    ? (collaboration.campaign.brand.name ?? "Brand")
    : `${collaboration.creator.user.firstName} ${collaboration.creator.user.lastName}`;
}
