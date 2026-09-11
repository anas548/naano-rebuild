import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from "@/components/brand/campaign-form";

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/brand/campaigns"
        className="inline-flex items-center gap-2 text-[0.875rem] text-ink/70 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to campaigns
      </Link>

      <h1 className="mt-5 font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Create a campaign
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/50">
        This brief is what every invited or applying creator will see.
      </p>

      <div className="mt-7 rounded-2xl border border-[#e6e8ef] bg-white p-6">
        <CampaignForm mode="create" />
      </div>
    </div>
  );
}
