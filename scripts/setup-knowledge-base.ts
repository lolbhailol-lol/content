/**
 * One-time setup: create CrwdCtrl-Brain/ folder structure and migrate legacy docs.
 * Run: npx tsx scripts/setup-knowledge-base.ts
 */
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const ROOT = process.cwd();
const KB = path.join(ROOT, "CrwdCtrl-Brain");

const DIRS = [
  "00_MASTER_CONTEXT",
  "01_VISION_STRATEGY",
  "02_FOUNDER/JOURNAL",
  "03_USERS/INTERVIEWS",
  "04_ORGANIZERS/FEEDBACK",
  "05_GROWTH",
  "06_REVENUE",
  "07_COMMUNITIES",
  "08_CONTENT/REELS",
  "08_CONTENT/CAROUSELS",
  "08_CONTENT/LINKEDIN",
  "09_CONTENT_ANALYTICS/MONTHLY_REPORTS",
  "10_PRODUCT",
  "11_SALES/CASE_STUDIES",
  "12_COMPETITORS",
  "13_INVESTORS",
  "14_EXPERIMENTS/GROWTH_EXPERIMENTS",
  "14_EXPERIMENTS/CONTENT_EXPERIMENTS",
  "14_EXPERIMENTS/PRODUCT_EXPERIMENTS",
  "14_EXPERIMENTS/REVENUE_EXPERIMENTS",
  "15_DECISIONS",
  "16_MEETINGS/ORGANIZER_CALLS",
  "16_MEETINGS/INVESTOR_CALLS",
  "16_MEETINGS/TEAM_MEETINGS",
  "16_MEETINGS/PARTNERSHIP_MEETINGS",
  "17_REPORTS/WEEKLY_CEO_REPORTS",
  "17_REPORTS/MONTHLY_REPORTS",
  "17_REPORTS/QUARTERLY_REPORTS",
  "18_AI_SYSTEM",
  "99_ARCHIVE/OLD_STRATEGIES",
  "99_ARCHIVE/OLD_CONTENT",
  "99_ARCHIVE/DEPRECATED",
];

const MOVES: Record<string, string> = {
  "MASTER_CONTEXT.md": "00_MASTER_CONTEXT/MASTER_CONTEXT.md",
  "01_PRODUCT_VISION.md": "01_VISION_STRATEGY/PRODUCT_VISION.md",
  "02_STARTUP_STORY.md": "02_FOUNDER/FOUNDER_STORY.md",
  "03_USER_PERSONAS.md": "03_USERS/USER_PERSONAS.md",
  "04_COMMUNITY_STRATEGY.md": "07_COMMUNITIES/COMMUNITY_STRATEGY.md",
  "05_GTM_STRATEGY.md": "05_GROWTH/GTM_STRATEGY.md",
  "06_REVENUE_MODEL.md": "06_REVENUE/REVENUE_MODEL.md",
  "07_CONTENT_STRATEGY.md": "08_CONTENT/CONTENT_STRATEGY.md",
  "CONTENT_OS.md": "08_CONTENT/CONTENT_OS.md",
  "08_COMPETITOR_ANALYSIS.md": "12_COMPETITORS/COMPETITOR_ANALYSIS.md",
  "09_INVESTOR_NARRATIVE.md": "13_INVESTORS/INVESTOR_NARRATIVE.md",
  "10_GROWTH_STRATEGY.md": "05_GROWTH/GROWTH_STRATEGY.md",
  "11_BRAND_POSITIONING.md": "01_VISION_STRATEGY/BRAND_POSITIONING.md",
  "12_30_60_90_DAY_PLAN.md": "00_MASTER_CONTEXT/CURRENT_PRIORITIES.md",
};

function stub(
  title: string,
  status: string,
  source?: string,
  bullets?: string[]
): string {
  const lines = [
    `# ${title}`,
    "",
    `> Status: **${status}**`,
  ];
  if (source) lines.push(`> Primary source: [${source}](${source})`);
  lines.push("", "---", "");
  if (bullets?.length) {
    lines.push("## Document this", "");
    for (const b of bullets) lines.push(`- ${b}`);
    lines.push("");
  }
  lines.push(
    "_This file is part of the CrwdCtrl-Brain knowledge base. Add content as the company learns._"
  );
  return lines.join("\n");
}

async function writeIfMissing(relPath: string, content: string) {
  const full = path.join(KB, relPath);
  if (fsSync.existsSync(full)) return;
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf-8");
}

async function main() {
  for (const dir of DIRS) {
    await fs.mkdir(path.join(KB, dir), { recursive: true });
  }

  for (const [from, to] of Object.entries(MOVES)) {
    const src = path.join(ROOT, from);
    const dest = path.join(KB, to);
    if (!fsSync.existsSync(src)) {
      console.log(`[skip] ${from} not found`);
      continue;
    }
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.rename(src, dest);
    console.log(`[move] ${from} → CrwdCtrl-Brain/${to}`);
  }

  await writeIfMissing(
    "00_MASTER_CONTEXT/QUICK_START.md",
    `# CrwdCtrl Brain — Knowledge Base Quick Start

> How to use and maintain the CrwdCtrl-Brain folder.

---

## Structure

Numbered folders \`00\`–\`18\` hold company knowledge. \`99_ARCHIVE\` holds deprecated material (not indexed by default).

## Adding knowledge

1. Add or edit \`.md\` files in the relevant folder
2. Run \`npm run reindex\` or ask Brain in chat (auto-reindexes when stale)
3. Major decisions → \`15_DECISIONS/\` or let Brain capture via chat memory

## Key entry points

| Need | Start here |
|------|------------|
| Full company context | \`MASTER_CONTEXT.md\` |
| What to do now | \`CURRENT_PRIORITIES.md\` |
| Product truth | \`10_PRODUCT/FEATURES.md\` |
| Content ops | \`08_CONTENT/CONTENT_OS.md\` |
| Competitors | \`12_COMPETITORS/COMPETITOR_ANALYSIS.md\` |

## Brain app

The Next.js app indexes \`CrwdCtrl-Brain/\` by default. Set \`DOCS_PATH\` in \`.env.local\` to override.
`
  );

  await writeIfMissing(
    "00_MASTER_CONTEXT/COMPANY_OVERVIEW.md",
    stub(
      "Company Overview",
      "Draft — see MASTER_CONTEXT.md",
      "MASTER_CONTEXT.md",
      [
        "One-liner and mission",
        "Stage, funding, team size",
        "Core product and hubs (Fests, Sports, Treks, Events)",
        "Geography and first market (MIT-WPU)",
      ]
    )
  );

  await writeIfMissing(
    "00_MASTER_CONTEXT/COMPANY_TIMELINE.md",
    stub(
      "Company Timeline",
      "Draft — extract from FOUNDER_STORY.md",
      "../02_FOUNDER/FOUNDER_STORY.md",
      [
        "Founding moment and first insight",
        "MVP milestones",
        "First organizers and transactions",
        "Play Store, fundraising, expansion dates",
      ]
    )
  );

  const visionStubs: Record<string, string[]> = {
    "MISSION.md": ["Mission statement", "Who we serve", "Problem we solve"],
    "VISION.md": ["10-year vision", "Category we win", "What success looks like"],
    "LONG_TERM_STRATEGY.md": [
      "Campus → city → national sequencing",
      "Supply vs demand bets",
      "Moat and defensibility",
    ],
    "NORTH_STAR_METRICS.md": [
      "Monthly Active Registrations",
      "Organizers active per campus",
      "Retention and repeat registration",
    ],
    "COMPANY_THESIS.md": [
      "Why now for India youth discovery",
      "Why WhatsApp is insufficient",
      "Why founder can win",
    ],
  };
  for (const [file, bullets] of Object.entries(visionStubs)) {
    await writeIfMissing(
      `01_VISION_STRATEGY/${file}`,
      stub(file.replace(".md", ""), "Draft — see PRODUCT_VISION.md", "PRODUCT_VISION.md", bullets)
    );
  }

  const founderStubs = [
    "PERSONAL_BRAND.md",
    "FOUNDER_LESSONS.md",
    "FOUNDER_BELIEFS.md",
    "NETWORK.md",
  ];
  for (const file of founderStubs) {
    await writeIfMissing(
      `02_FOUNDER/${file}`,
      stub(file.replace(".md", ""), "Draft", "../02_FOUNDER/FOUNDER_STORY.md")
    );
  }

  await writeIfMissing(
    "02_FOUNDER/JOURNAL/2026-06-18.md",
    `# Founder Journal — 2026-06-18

## What happened today

-

## Decisions made

-

## Learnings

-

## Tomorrow

-
`
  );

  await writeIfMissing(
    "02_FOUNDER/JOURNAL/2026-06-19.md",
    `# Founder Journal — 2026-06-19

## What happened today

-

## Decisions made

-

## Learnings

-

## Tomorrow

-
`
  );

  const competitors: Record<string, string> = {
    "DISTRICT.md": "District / Zomato events — metro discovery, brand partnerships",
    "BOOKMYSHOW.md": "See COMPETITOR_ANALYSIS.md § BookMyShow",
    "TOWNSCRIPT.md": "Indian event registration, payments, organizer dashboards",
    "EVENTBRITE.md": "Global self-serve events platform",
    "MEETUP.md": "See COMPETITOR_ANALYSIS.md § Meetup.com",
    "STRAVA.md": "See COMPETITOR_ANALYSIS.md § Strava",
    "ALLTRAILS.md": "Outdoor discovery — trek/community angle",
  };
  for (const [file, note] of Object.entries(competitors)) {
    await writeIfMissing(
      `12_COMPETITORS/${file}`,
      stub(
        file.replace(".md", ""),
        "Stub — expand with dedicated research",
        "COMPETITOR_ANALYSIS.md",
        [note, "Strengths vs CrwdCtrl", "Weaknesses we exploit", "Threat level"]
      )
    );
  }

  await writeIfMissing(
    "15_DECISIONS/DECISION_LOG.md",
    `# Decision Log

> Institutional decisions. Brain also auto-captures decisions from chat into \`.brain/memory/\`.

| ID | Date | Decision | Status |
|----|------|----------|--------|
| DEC-001 | TBD | Cashfree as payment provider | See DEC-001-CASHFREE.md |
| DEC-002 | TBD | Trek community expansion | See DEC-002-TREK_EXPANSION.md |
| DEC-003 | TBD | Run club focus | See DEC-003-RUN_CLUBS.md |

Add new decisions as \`DEC-XXX-SLUG.md\` files and update this table.
`
  );

  for (const dec of [
    "DEC-001-CASHFREE.md",
    "DEC-002-TREK_EXPANSION.md",
    "DEC-003-RUN_CLUBS.md",
  ]) {
    await writeIfMissing(
      `15_DECISIONS/${dec}`,
      stub(dec.replace(".md", ""), "Document decision", "DECISION_LOG.md", [
        "Decision",
        "Reasoning",
        "Expected outcome",
        "Risks",
        "Actual outcome (when known)",
      ])
    );
  }

  await writeIfMissing(
    "17_REPORTS/HEALTH_DASHBOARD.md",
    `# Startup Health Dashboard

> Generated by CrwdCtrl Brain → Company Intelligence panel.

## Dimensions scored (1–10)

Product · Growth · Revenue · Distribution · Community · Content · Retention

## How to refresh

1. Open Brain app → chart icon → **Startup Health** → Refresh
2. Or \`POST /api/intelligence/health\`

Reports are stored in \`.brain/memory/strategic-memory.json\`.
`
  );

  await writeIfMissing(
    "18_AI_SYSTEM/SYSTEM_PROMPTS.md",
    `# AI System Prompts

> Production prompts live in the app codebase.

| Agent | Code |
|-------|------|
| All modes | \`lib/prompts.ts\` |
| Competitive intel | \`lib/competitive-intelligence.ts\` |
| Intelligence scans | \`lib/intelligence/analyzer.ts\` |
| Strategic memory | \`lib/memory/store.ts\` |

Mode-specific behavior: CEO, Growth, Content, Product, Investor, Sales, **Board**.
`
  );

  const aiAgents = [
    "AI_PROMPTS.md",
    "CONTENT_AGENT.md",
    "CEO_AGENT.md",
    "SALES_AGENT.md",
    "GROWTH_AGENT.md",
    "INVESTOR_AGENT.md",
  ];
  for (const file of aiAgents) {
    await writeIfMissing(
      `18_AI_SYSTEM/${file}`,
      stub(file.replace(".md", ""), "Document agent spec", "SYSTEM_PROMPTS.md")
    );
  }

  const folderStubs: Record<string, string[]> = {
    "03_USERS/STUDENT_PERSONAS.md": ["See USER_PERSONAS.md"],
    "03_USERS/TREKKER_PERSONAS.md": ["Trek leader and participant personas"],
    "03_USERS/RUNNER_PERSONAS.md": ["Run club member personas"],
    "03_USERS/COMMUNITY_BUILDER_PERSONAS.md": ["Community admin personas"],
    "03_USERS/USER_RESEARCH.md": ["Interview synthesis", "Survey results"],
    "04_ORGANIZERS/ORGANIZER_PERSONAS.md": ["Arjun (fest)", "Ananya (run club)"],
    "04_ORGANIZERS/FEST_ORGANIZERS.md": ["Fest organizer pain and pitch"],
    "04_ORGANIZERS/TREK_ORGANIZERS.md": ["Trek leader onboarding"],
    "04_ORGANIZERS/RUN_CLUB_ORGANIZERS.md": ["Run club leader needs"],
    "04_ORGANIZERS/THEATRE_ORGANIZERS.md": ["Events hub — not 'theatre' product label"],
    "05_GROWTH/ACQUISITION.md": ["See GROWTH_STRATEGY.md", "GTM_STRATEGY.md"],
    "05_GROWTH/RETENTION.md": ["Repeat registration", "Notification strategy"],
    "05_GROWTH/REFERRAL_STRATEGY.md": ["Referral loops", "Incentives"],
    "05_GROWTH/AMBASSADOR_PROGRAM.md": ["Campus ambassadors", "MIT-WPU pilot"],
    "05_GROWTH/CITY_EXPANSION.md": ["Pune → next cities", "Depth before breadth"],
    "05_GROWTH/GROWTH_EXPERIMENTS.md": ["Hypothesis / metric / result log"],
    "06_REVENUE/PRICING.md": ["3% platform fee", "Cashfree"],
    "06_REVENUE/UNIT_ECONOMICS.md": ["CAC", "LTV", "Take rate"],
    "06_REVENUE/CASHFLOW.md": ["Burn", "Runway"],
    "06_REVENUE/SPONSORSHIPS.md": ["Brand partnerships"],
    "06_REVENUE/PARTNERSHIPS.md": ["Campus / venue partnerships"],
    "06_REVENUE/FINANCIAL_PROJECTIONS.md": ["12-month model"],
    "07_COMMUNITIES/TREKS.md": ["Trek communities hub"],
    "07_COMMUNITIES/RUN_CLUBS.md": ["Run club profiles"],
    "07_COMMUNITIES/MARATHONS.md": ["Race events"],
    "07_COMMUNITIES/THEATRE.md": ["Events hub content"],
    "07_COMMUNITIES/STUDENT_CLUBS.md": ["Campus clubs"],
    "07_COMMUNITIES/COMMUNITY_DATABASE.md": ["Active communities list"],
    "08_CONTENT/CONTENT_PILLARS.md": ["See CONTENT_OS.md pillars"],
    "08_CONTENT/STORY_LIBRARY.md": ["Founder stories", "User stories"],
    "08_CONTENT/HOOK_LIBRARY.md": ["Reel hooks", "See CONTENT_OS.md"],
    "08_CONTENT/CTA_LIBRARY.md": ["CTAs by platform"],
    "08_CONTENT/CONTENT_CALENDAR.md": ["Weekly rhythm"],
    "09_CONTENT_ANALYTICS/TOP_PERFORMING_CONTENT.md": ["What worked"],
    "09_CONTENT_ANALYTICS/FAILED_CONTENT.md": ["What flopped"],
    "09_CONTENT_ANALYTICS/CONTENT_INSIGHTS.md": ["Patterns"],
    "10_PRODUCT/PRODUCT_STRATEGY.md": ["See PRODUCT_VISION.md"],
    "10_PRODUCT/FEATURES.md": ["Live vs planned features only"],
    "10_PRODUCT/ROADMAP.md": ["Quarterly priorities"],
    "10_PRODUCT/ARCHITECTURE.md": ["React + Express + MongoDB stack"],
    "10_PRODUCT/MOBILE_APP.md": ["Capacitor Android"],
    "10_PRODUCT/PRODUCT_FEEDBACK.md": ["User and organizer feedback"],
    "11_SALES/SALES_PLAYBOOK.md": ["Organizer acquisition flow"],
    "11_SALES/ORGANIZER_OUTREACH.md": ["Outreach sequences"],
    "11_SALES/SPONSORSHIP_OUTREACH.md": ["Brand outreach"],
    "11_SALES/EMAIL_TEMPLATES.md": ["Email copy"],
    "11_SALES/WHATSAPP_TEMPLATES.md": ["WhatsApp copy"],
    "13_INVESTORS/PITCH_DECK.md": ["Deck outline"],
    "13_INVESTORS/FUNDRAISING.md": ["Round strategy"],
    "13_INVESTORS/INVESTOR_FEEDBACK.md": ["Call notes"],
    "13_INVESTORS/TERM_SHEETS.md": ["Terms received"],
    "13_INVESTORS/INVESTOR_FAQ.md": ["FAQ for investors"],
  };

  for (const [rel, bullets] of Object.entries(folderStubs)) {
    const name = path.basename(rel, ".md");
    await writeIfMissing(
      rel,
      stub(name.replace(/_/g, " "), "Draft", undefined, bullets)
    );
  }

  await writeIfMissing(
    "99_ARCHIVE/DEPRECATED/.gitkeep",
    ""
  );

  console.log("\nDone. CrwdCtrl-Brain/ is ready. Run: npm run reindex");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
