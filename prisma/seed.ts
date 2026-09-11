import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL,
  }),
});

// The industry tags a creator picks from during onboarding (max 3).
const INDUSTRIES = [
  "B2B",
  "B2C",
  "AI",
  "SaaS",
  "Software",
  "Sales",
  "Marketing",
  "SEO",
  "Outreach",
  "CRM",
  "Creative",
  "Productivity",
  "Fintech",
  "HealthTech",
  "EdTech",
  "Cybersecurity",
  "Growth / GTM",
  "HR",
  "E-commerce",
  "Developer Tools",
  "Data / Analytics",
  "Customer Support",
  "Design",
  "Real Estate / PropTech",
  "LegalTech",
];

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  for (const label of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { slug: slugify(label) },
      update: { label },
      create: { slug: slugify(label), label },
    });
  }
  console.log(`Seeded ${INDUSTRIES.length} industries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
