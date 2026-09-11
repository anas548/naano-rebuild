import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { countUnreadConversations, ensureConversations } from "@/lib/messaging";
import { CreatorSidebar } from "@/components/app/creator-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

export default async function CreatorLayout({
  children,
}: LayoutProps<"/creator">) {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  // ensureConversations opens the NaanoBot thread (and any missing
  // collaboration threads) before the badge count runs, so the sidebar can
  // show an unread NaanoBot message even if the creator never visited
  // Messages yet.
  await ensureConversations(user.id);

  const [earnings, unreadMessages] = await Promise.all([
    prisma.earning.aggregate({
      where: { collaboration: { creator: { userId: user.id } }, status: "AVAILABLE" },
      _sum: { netCents: true },
    }),
    countUnreadConversations(user.id),
  ]);

  return (
    <div className="flex min-h-screen bg-[#f9fafa]">
      <CreatorSidebar unreadMessages={unreadMessages} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          balanceCents={earnings._sum.netCents ?? 0}
          name={`${user.firstName} ${user.lastName}`}
        />
        <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
