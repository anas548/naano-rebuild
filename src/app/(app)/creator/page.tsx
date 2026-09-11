import { requireUser } from "@/lib/session";
import { DashboardPlaceholder } from "@/components/app/dashboard-placeholder";

export default async function CreatorHomePage() {
  const user = await requireUser();

  return (
    <DashboardPlaceholder
      firstName={user.firstName}
      role="Creator"
      next="The creator card builder and your workspace are the next things to build."
    />
  );
}
