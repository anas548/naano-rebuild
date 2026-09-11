import "server-only";
import { prisma } from "@/lib/prisma";

/** Every creator page needs the profile plus its industry tags. */
export async function getCreatorProfile(userId: string) {
  return prisma.creatorProfile.findUnique({
    where: { userId },
    include: { industries: { select: { label: true } } },
  });
}
