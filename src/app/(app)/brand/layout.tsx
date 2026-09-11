import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { nextOnboardingStep } from "@/lib/brand-onboarding";
import { BrandSidebar } from "@/components/app/brand-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

export default async function BrandLayout({ children }: LayoutProps<"/brand">) {
  const user = await requireUser();
  if (user.role !== "BRAND") redirect("/creator");

  const brand = await prisma.brand.findUnique({
    where: { userId: user.id },
    include: { icps: { select: { id: true } } },
  });
  if (!brand) redirect("/signup/brand");

  const resumeStep = nextOnboardingStep(brand);
  if (resumeStep) redirect(resumeStep);

  return (
    <div className="flex min-h-screen bg-[#f9fafa]">
      <BrandSidebar brandName={brand.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          balanceCents={brand.balanceCents}
          name={`${user.firstName} ${user.lastName}`}
        />
        <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
