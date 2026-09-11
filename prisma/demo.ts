import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL,
  }),
});

// Demo brands and campaigns, so the creator-side marketplace has something real
// to read until the brand side can create these itself.
const BRANDS = [
  {
    email: "demo-brand-lemlist@naano.demo",
    firstName: "Chloe",
    lastName: "Marchand",
    name: "lemlist",
    websiteUrl: "https://lemlist.com",
    valueProposition:
      "lemlist helps outbound sales teams run personalised multichannel sequences that actually get replies.",
    icps: [
      { title: "Outbound SDR teams", description: "SDRs running high-volume sequences who need better reply rates." },
      { title: "Founder-led sales", description: "Early-stage founders doing their own prospecting." },
      { title: "Agency sales leaders", description: "Agencies running outbound on behalf of clients." },
    ],
    campaigns: [
      {
        name: "Outbound that gets replies",
        briefProduct:
          "Show how a personalised multichannel sequence beats a generic mass email, using your own outbound workflow as the example.",
        briefAudience: "Outbound SDR teams · Founder-led sales",
        committedBudgetCents: 480000,
      },
      {
        name: "AI prospecting workflows",
        briefProduct:
          "Walk through how you use AI to research accounts before writing the first line of an email.",
        briefAudience: "Agency sales leaders · Outbound SDR teams",
        committedBudgetCents: 260000,
      },
    ],
  },
  {
    email: "demo-brand-blogseo@naano.demo",
    firstName: "Vincent",
    lastName: "Josse",
    name: "BlogSEO",
    websiteUrl: "https://blogseo.com",
    valueProposition:
      "BlogSEO turns product-led SaaS content into organic pipeline, with briefs and drafts that rank.",
    icps: [
      { title: "SaaS content leads", description: "Content leads owning organic acquisition targets." },
      { title: "Technical founders", description: "Founders writing their own launch content." },
      { title: "SEO consultants", description: "Consultants delivering content programmes for clients." },
    ],
    campaigns: [
      {
        name: "Creator content to product signups",
        briefProduct:
          "Explain how you trace a trial signup back to the exact post that drove it, and why attribution changes what you publish.",
        briefAudience: "SaaS content leads · SEO consultants",
        committedBudgetCents: 350000,
      },
    ],
  },
  {
    email: "demo-brand-leadbay@naano.demo",
    firstName: "Amina",
    lastName: "Cherif",
    name: "LEADBAY",
    websiteUrl: "https://leadbay.io",
    valueProposition:
      "LEADBAY scores and routes inbound leads so sales teams stop wasting time on the wrong accounts.",
    icps: [
      { title: "RevOps managers", description: "RevOps owners cleaning up routing and scoring." },
      { title: "Sales leaders", description: "Heads of sales measured on pipeline quality." },
      { title: "B2B growth teams", description: "Growth teams optimising inbound conversion." },
    ],
    campaigns: [
      {
        name: "Stop working the wrong leads",
        briefProduct:
          "Break down how much selling time is lost to unqualified inbound, and what changes when scoring is automated.",
        briefAudience: "RevOps managers · Sales leaders",
        committedBudgetCents: 620000,
      },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("demo-password", 10);

  for (const brand of BRANDS) {
    const user = await prisma.user.upsert({
      where: { email: brand.email },
      update: {},
      create: {
        email: brand.email,
        firstName: brand.firstName,
        lastName: brand.lastName,
        role: "BRAND",
        passwordHash,
        brand: {
          create: {
            name: brand.name,
            websiteUrl: brand.websiteUrl,
            valueProposition: brand.valueProposition,
            onboardingCompleted: true,
            balanceCents: 1_000_000,
          },
        },
      },
      include: { brand: true },
    });

    const brandId = user.brand!.id;

    for (const [index, icp] of brand.icps.entries()) {
      await prisma.icp.upsert({
        where: { brandId_rank: { brandId, rank: index + 1 } },
        update: icp,
        create: { brandId, rank: index + 1, ...icp },
      });
    }

    for (const campaign of brand.campaigns) {
      const existing = await prisma.campaign.findFirst({
        where: { brandId, name: campaign.name },
        select: { id: true },
      });
      if (existing) continue;

      await prisma.campaign.create({
        data: {
          brandId,
          ...campaign,
          status: "ACTIVE",
          openToApplications: true,
        },
      });
    }

    console.log(`seeded ${brand.name}`);
  }

  const campaigns = await prisma.campaign.count({ where: { openToApplications: true } });
  console.log(`open campaigns now available: ${campaigns}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
