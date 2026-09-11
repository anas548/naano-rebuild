import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CardEditor } from "@/components/creator/card-editor";

export default async function CreatorCardPage() {
  const user = await requireUser();
  const [profile, industries, headerList] = await Promise.all([
    prisma.creatorProfile.findUnique({
      where: { userId: user.id },
      include: { industries: { select: { id: true, label: true } } },
    }),
    prisma.industry.findMany({ orderBy: { label: "asc" } }),
    headers(),
  ]);

  if (!profile) return null;

  const host = headerList.get("host") ?? "naano.co";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const cardUrl = `${protocol}://${host}/c/${profile.cardSlug}`;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="rounded-2xl border border-[#e6e8ef] bg-white p-7">
        <CardEditor
          cardUrl={cardUrl}
          industries={industries}
          selectedIndustryIds={profile.industries.map((i) => i.id)}
          pricePerPostEuros={
            profile.pricePerPostCents ? String(profile.pricePerPostCents / 100) : ""
          }
          card={{
            name: `${user.firstName} ${user.lastName}`,
            headline: profile.headline,
            industries: profile.industries.map((i) => i.label),
            followerCount: profile.followerCount,
            estImpressions: null,
            pricePerPostCents: profile.pricePerPostCents || null,
            hasPostData: profile.publicPostCount > 0,
            countryCode: profile.country,
          }}
        />
      </div>
    </div>
  );
}
