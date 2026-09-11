import "server-only";
import { prisma } from "@/lib/prisma";

/** Shared by the Earnings page (display) and the withdraw action
 *  (validation), so "how much can you withdraw" is computed once, the same
 *  way, in both places. */
export async function getCreatorEarnings(userId: string) {
  // Earnings come from completed collaborations. Where an Earning row exists
  // it decides the payout stage; otherwise the money is simply available.
  const completed = await prisma.collaboration.findMany({
    where: { creator: { userId }, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    include: {
      earning: { select: { status: true, releasedAt: true } },
      campaign: { include: { brand: { select: { name: true } } } },
    },
  });

  const stageOf = (row: (typeof completed)[number]) => row.earning?.status ?? "AVAILABLE";

  const totalEarned = completed.reduce((n, row) => n + row.creatorNetCents, 0);
  const inTransit = completed
    .filter((row) => stageOf(row) === "IN_TRANSIT")
    .reduce((n, row) => n + row.creatorNetCents, 0);
  const rawAvailable = completed
    .filter((row) => stageOf(row) === "AVAILABLE")
    .reduce((n, row) => n + row.creatorNetCents, 0);
  const awaitingRelease = completed.filter((row) => stageOf(row) === "AWAITING_RELEASE").length;

  // Withdrawals draw down the available pool as soon as they're made, not
  // only once "paid" — a pending transfer has already left the balance you
  // can withdraw again from. No Earning row is ever touched for this: the
  // pool is (available earnings) minus (everything ever withdrawn), which
  // handles a partial withdrawal correctly without splitting collaborations.
  const withdrawals = await prisma.withdrawal.findMany({
    where: { creator: { userId } },
    orderBy: { createdAt: "desc" },
    include: { payoutMethod: { select: { type: true } } },
  });
  const withdrawnTotal = withdrawals.reduce((n, w) => n + w.amountCents, 0);
  const available = Math.max(0, rawAvailable - withdrawnTotal);

  return {
    completed,
    stageOf,
    totalEarned,
    inTransit,
    available,
    awaitingRelease,
    withdrawals,
  };
}
