import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreatorCard } from "@/components/creator/creator-card";

export default async function PublicCardPage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;

  const profile = await prisma.creatorProfile.findUnique({
    where: { cardSlug: slug },
    include: {
      user: { select: { firstName: true, lastName: true } },
      industries: { select: { label: true } },
    },
  });

  if (!profile) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-5 py-16">
      <CreatorCard
        className="max-w-[495px]"
        data={{
          name: `${profile.user.firstName} ${profile.user.lastName}`,
          headline: profile.headline,
          industries: profile.industries.map((i) => i.label),
          followerCount: profile.followerCount,
          estImpressions: null,
          pricePerPostCents: profile.pricePerPostCents || null,
          hasPostData: profile.publicPostCount > 0,
          countryCode: profile.country,
        }}
      />
    </main>
  );
}
