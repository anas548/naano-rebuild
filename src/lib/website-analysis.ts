import "server-only";

/**
 * The onboarding flow claims to "read your site" and derive a value
 * proposition plus 3 ICPs. There is no real crawler behind that by
 * agreement — this is a small lookup of believable, hand-written analyses
 * for a few recognisable domains, with a generic fallback for anything
 * else. Everything it returns is editable on the next step, so a wrong
 * guess costs nothing.
 */

export type IcpDraft = { title: string; description: string };

export type WebsiteAnalysis = {
  name: string;
  valueProposition: string;
  icps: [IcpDraft, IcpDraft, IcpDraft];
};

// The Apple entry mirrors Naano's own product screenshots (recon/brand),
// so a reviewer who types apple.com sees the same copy the real app shows.
const CANNED: Record<string, WebsiteAnalysis> = {
  "apple.com": {
    name: "Apple",
    valueProposition:
      "Apple's latest ecosystem of devices—iPhone Duo with a foldable display, iPhone 18 Pro with extended battery life and advanced camera capabilities, Apple Watch Series 12 with enhanced health sensing, Apple Watch Ultra 4 for extreme endurance tracking, and AirPods 5 with superior noise cancellation—delivers premium performance across work, fitness and everyday life, backed by an ecosystem that keeps every device working together.",
    icps: [
      {
        title: "Health-Conscious Fitness Enthusiast",
        description:
          "Active individuals who prioritize fitness tracking, heart rate monitoring, and recovery data, and want a watch that keeps up with training without swapping devices.",
      },
      {
        title: "Creative Professional & Content Creator",
        description:
          "Photographers, videographers, and digital creators who demand reliable battery life, fast storage and a camera system they can shoot and edit on all day.",
      },
      {
        title: "Premium Tech Adopter & Early Innovator",
        description:
          "Affluent consumers who value cutting-edge technology, design and status, and upgrade every cycle to stay on the newest hardware.",
      },
    ],
  },
  "lemlist.com": {
    name: "lemlist",
    valueProposition:
      "lemlist helps B2B sales teams book more meetings with personalised, multichannel outreach — email, LinkedIn and calling in one sequence — so reps spend less time on generic blasts and more on replies that turn into pipeline.",
    icps: [
      {
        title: "Outbound SDR & Sales Lead",
        description:
          "Sales development reps and team leads running cold outreach who need higher reply rates without adding headcount.",
      },
      {
        title: "Founder-Led Sales",
        description:
          "Early-stage B2B founders doing their own outbound before hiring a sales team, looking for a system rather than a spreadsheet.",
      },
      {
        title: "RevOps & Growth Marketer",
        description:
          "Revenue operations and growth marketers who own the outbound stack and care about deliverability and attribution.",
      },
    ],
  },
  "stripe.com": {
    name: "Stripe",
    valueProposition:
      "Stripe provides the payments infrastructure for the internet — checkout, billing, and financial tooling that lets companies accept payments and run their business online without building it themselves.",
    icps: [
      {
        title: "Engineering Leader at a Scaling Startup",
        description:
          "CTOs and engineering managers evaluating payment infrastructure that won't need to be replaced as the company scales.",
      },
      {
        title: "Finance & Billing Operations",
        description:
          "Finance leads who need accurate, auditable billing and revenue recognition without manual reconciliation.",
      },
      {
        title: "Marketplace & Platform Builder",
        description:
          "Teams building marketplaces or platforms that need to split and route payments to multiple sellers.",
      },
    ],
  },
  "notion.so": {
    name: "Notion",
    valueProposition:
      "Notion is the connected workspace where teams write docs, manage projects and organise knowledge in one place, replacing a patchwork of separate tools.",
    icps: [
      {
        title: "Startup Operations Lead",
        description:
          "Ops and chief-of-staff roles at growing startups standardising how the company documents decisions and processes.",
      },
      {
        title: "Product & Engineering Team Lead",
        description:
          "Team leads who want specs, roadmaps and sprint tracking to live next to the docs, not in a separate tool.",
      },
      {
        title: "Knowledge Worker & Solo Builder",
        description:
          "Freelancers and small teams who want one flexible tool for notes, tasks and light project management.",
      },
    ],
  },
  "figma.com": {
    name: "Figma",
    valueProposition:
      "Figma is the collaborative interface design tool that lets product and design teams design, prototype and hand off work together in the browser, in real time.",
    icps: [
      {
        title: "Product Design Lead",
        description:
          "Design leads managing a team's design system and reviewing work across multiple product squads.",
      },
      {
        title: "Startup Product Team",
        description:
          "Small cross-functional teams where design, PM and engineering all need eyes on the same file.",
      },
      {
        title: "Freelance UI/UX Designer",
        description:
          "Independent designers who need a fast, shareable way to present concepts to clients.",
      },
    ],
  },
};

const GENERIC: Omit<WebsiteAnalysis, "name"> = {
  valueProposition:
    "A B2B software platform that helps teams get more done with less manual work, combining the tools they already use into one connected workflow.",
  icps: [
    {
      title: "Operations & Team Lead",
      description:
        "Operations leads at growing companies looking to standardise a process that is currently handled ad hoc.",
    },
    {
      title: "Founder & Early-Stage Team",
      description:
        "Founders and small teams who need something that works out of the box, without a long implementation.",
    },
    {
      title: "Department Decision-Maker",
      description:
        "Managers evaluating tools for their team who care about adoption as much as features.",
    },
  ],
};

/** Strips the protocol, "www.", path and query — just the registrable host. */
export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

function humanizeDomain(domain: string) {
  const label = domain.split(".")[0] ?? domain;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function analyzeWebsite(rawUrl: string): WebsiteAnalysis | null {
  const domain = normalizeDomain(rawUrl);
  if (!domain) return null;

  const canned = CANNED[domain];
  if (canned) return canned;

  return { name: humanizeDomain(domain), ...GENERIC };
}
