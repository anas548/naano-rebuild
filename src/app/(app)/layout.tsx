import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return <>{children}</>;
}
