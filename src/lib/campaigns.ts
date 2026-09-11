import type { CampaignStatus } from "@/generated/prisma/enums";

export type CampaignTab = {
  slug: string;
  label: string;
  statuses: CampaignStatus[] | null; // null means "all"
};

export const CAMPAIGN_TABS: CampaignTab[] = [
  { slug: "all", label: "All", statuses: null },
  { slug: "active", label: "Active", statuses: ["ACTIVE"] },
  { slug: "draft", label: "Draft", statuses: ["DRAFT"] },
  { slug: "completed", label: "Completed", statuses: ["COMPLETED"] },
];

export function resolveCampaignTab(slug: string | undefined) {
  return CAMPAIGN_TABS.find((t) => t.slug === slug) ?? CAMPAIGN_TABS[0];
}

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: "bg-neutral-100 text-ink/55",
  ACTIVE: "bg-[#e2faef] text-[#00834a]",
  COMPLETED: "bg-[#ecf1ff] text-naano-violet",
};
