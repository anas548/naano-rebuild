import { headers } from "next/headers";
import { requireUser } from "@/lib/session";
import { getCreatorProfile } from "@/lib/creator";
import { AffiliatePanels } from "@/components/creator/affiliate-panels";

export default async function CreatorAffiliatePage() {
  const user = await requireUser();
  const [profile, headerList] = await Promise.all([
    getCreatorProfile(user.id),
    headers(),
  ]);

  const host = headerList.get("host") ?? "naano.co";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const handle = profile?.cardSlug ?? "you";

  // Referral attribution is not implemented, so these point at the real signup
  // routes with a ref tag rather than a link that would 404.
  return (
    <AffiliatePanels
      brandLink={`${protocol}://${host}/signup/brand?ref=${handle}`}
      creatorLink={`${protocol}://${host}/signup/creator?ref=${handle}`}
      cardPublished={Boolean(profile?.onboardingCompleted)}
      rewardsEarnedCents={0}
      creatorsInvited={0}
      earningNow={0}
    />
  );
}
