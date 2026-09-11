import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CreatorSidebar } from "@/components/app/creator-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

export default async function CreatorLayout({
  children,
}: LayoutProps<"/creator">) {
  const user = await requireUser();
  if (user.role !== "CREATOR") redirect("/brand");

  const earnings = await prisma.earning.aggregate({
    where: { collaboration: { creator: { userId: user.id } }, status: "AVAILABLE" },
    _sum: { netCents: true },
  });

  return (
    <div className="flex min-h-screen bg-[#f9fafa]">
      <CreatorSidebar />
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
