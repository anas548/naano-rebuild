import { requireUser } from "@/lib/session";
import { DashboardPlaceholder } from "@/components/app/dashboard-placeholder";

export default async function BrandHomePage() {
  const user = await requireUser();

  return (
    <DashboardPlaceholder
      firstName={user.firstName}
      role="Brand"
      next="Brand onboarding and the campaign dashboard are the next things to build."
    />
  );
}
