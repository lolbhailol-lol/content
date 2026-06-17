import type { BrainMode, ModeConfig } from "./types";

export const BRAIN_MODES: ModeConfig[] = [
  {
    id: "ceo",
    label: "CEO Mode",
    description: "Strategic priorities, tradeoffs, and company direction",
    icon: "Crown",
    focus: [
      "North star metrics and strategic focus",
      "Resource allocation and sequencing",
      "Risk assessment and mitigation",
      "When to go deep vs. expand",
    ],
  },
  {
    id: "growth",
    label: "Growth Mode",
    description: "Acquisition, retention, campus expansion, flywheel",
    icon: "TrendingUp",
    focus: [
      "Campus and community acquisition",
      "Ambassador program and referrals",
      "Funnel optimization and experiments",
      "30/60/90 execution priorities",
    ],
  },
  {
    id: "content",
    label: "Content Mode",
    description: "Karan's storyteller — reels, hooks, LinkedIn, raw material → 7 formats",
    icon: "PenLine",
    focus: [
      "Karan's voice: document, don't perform",
      "Raw material → reel, carousel, LinkedIn, story, CTA",
      "Student / organizer / founder angle check",
      "Reject generic motivation and hustle theater",
    ],
  },
  {
    id: "product",
    label: "Product Mode",
    description: "Features, roadmap, personas, and product decisions",
    icon: "Layers",
    focus: [
      "Product capabilities (verified only)",
      "User personas and flows",
      "Roadmap priorities and technical risks",
      "Organizer and student UX",
    ],
  },
  {
    id: "investor",
    label: "Investor Mode",
    description: "Narrative, traction, unit economics, and fundraising",
    icon: "Briefcase",
    focus: [
      "Investor hook and traction story",
      "Market size and competitive moat",
      "Revenue model and unit economics",
      "Milestone targets for next round",
    ],
  },
  {
    id: "sales",
    label: "Sales Mode",
    description: "Organizer acquisition, objections, and onboarding",
    icon: "Users",
    focus: [
      "Organizer pain points and ROI pitch",
      "WhatsApp/Google Forms objection handling",
      "Campus fest and community onboarding",
      "Self-serve listing and success stories",
    ],
  },
  {
    id: "board",
    label: "Board Mode",
    description: "Investor + board challenge on every decision",
    icon: "Gavel",
    focus: [
      "Hard questions on product and revenue",
      "Traction vs narrative gaps",
      "Expansion and burn tradeoffs",
      "Approve / condition / reject framing",
    ],
  },
];

export function getModeConfig(mode: BrainMode): ModeConfig {
  const config = BRAIN_MODES.find((m) => m.id === mode);
  if (!config) throw new Error(`Unknown mode: ${mode}`);
  return config;
}

export const DEFAULT_MODE: BrainMode = "ceo";

export function isBrainMode(value: string): value is BrainMode {
  return BRAIN_MODES.some((m) => m.id === value);
}
