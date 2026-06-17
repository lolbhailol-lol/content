import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  ContradictionReport,
  Decision,
  Experiment,
  HealthReport,
  ResearchGapReport,
  StrategicMemoryStore,
  StrategicNote,
  WeeklyReport,
} from "./types";
import { EMPTY_MEMORY } from "./types";

function getMemoryDir(): string {
  if (process.env.BRAIN_MEMORY_PATH) {
    return process.env.BRAIN_MEMORY_PATH;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "crwdctrl-brain", "memory");
  }
  return path.join(process.cwd(), ".brain", "memory");
}

function getMemoryFile(): string {
  return path.join(getMemoryDir(), "strategic-memory.json");
}

async function ensureMemoryDir(): Promise<void> {
  await fs.mkdir(getMemoryDir(), { recursive: true });
}

export async function loadMemory(): Promise<StrategicMemoryStore> {
  try {
    const raw = await fs.readFile(getMemoryFile(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<StrategicMemoryStore>;
    return { ...EMPTY_MEMORY, ...parsed };
  } catch {
    return { ...EMPTY_MEMORY };
  }
}

export async function saveMemory(store: StrategicMemoryStore): Promise<void> {
  await ensureMemoryDir();
  await fs.writeFile(getMemoryFile(), JSON.stringify(store, null, 2), "utf-8");
}

export async function addDecision(
  input: Omit<Decision, "id" | "createdAt" | "updatedAt" | "status" | "source"> & {
    status?: Decision["status"];
    source?: Decision["source"];
  }
): Promise<Decision> {
  const store = await loadMemory();
  const now = new Date().toISOString();
  const decision: Decision = {
    id: uuidv4(),
    status: input.status ?? "pending",
    source: input.source ?? "manual",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  store.decisions.unshift(decision);
  if (store.decisions.length > 100) store.decisions = store.decisions.slice(0, 100);
  await saveMemory(store);
  return decision;
}

export async function addExperiment(
  input: Omit<Experiment, "id" | "createdAt" | "updatedAt" | "status" | "source"> & {
    status?: Experiment["status"];
    source?: Experiment["source"];
  }
): Promise<Experiment> {
  const store = await loadMemory();
  const now = new Date().toISOString();
  const experiment: Experiment = {
    id: uuidv4(),
    status: input.status ?? "planned",
    source: input.source ?? "manual",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  store.experiments.unshift(experiment);
  if (store.experiments.length > 100) store.experiments = store.experiments.slice(0, 100);
  await saveMemory(store);
  return experiment;
}

export async function addNote(
  input: Omit<StrategicNote, "id" | "createdAt">
): Promise<StrategicNote> {
  const store = await loadMemory();
  const note: StrategicNote = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.notes.unshift(note);
  if (store.notes.length > 150) store.notes = store.notes.slice(0, 150);
  await saveMemory(store);
  return note;
}

export async function saveHealthReport(report: HealthReport): Promise<void> {
  const store = await loadMemory();
  store.healthReports.unshift(report);
  if (store.healthReports.length > 20) store.healthReports = store.healthReports.slice(0, 20);
  await saveMemory(store);
}

export async function saveContradictionReport(
  report: ContradictionReport
): Promise<void> {
  const store = await loadMemory();
  store.contradictionReports.unshift(report);
  if (store.contradictionReports.length > 20) {
    store.contradictionReports = store.contradictionReports.slice(0, 20);
  }
  await saveMemory(store);
}

export async function saveWeeklyReport(report: WeeklyReport): Promise<void> {
  const store = await loadMemory();
  store.weeklyReports.unshift(report);
  if (store.weeklyReports.length > 20) store.weeklyReports = store.weeklyReports.slice(0, 20);
  await saveMemory(store);
}

export async function saveResearchGapReport(report: ResearchGapReport): Promise<void> {
  const store = await loadMemory();
  store.researchGapReports.unshift(report);
  if (store.researchGapReports.length > 20) {
    store.researchGapReports = store.researchGapReports.slice(0, 20);
  }
  await saveMemory(store);
}

export function formatMemoryForContext(store: StrategicMemoryStore): string {
  const sections: string[] = [];

  if (store.decisions.length) {
    sections.push(
      "RECENT DECISIONS (institutional memory — reference and avoid repeating mistakes):",
      ...store.decisions.slice(0, 8).map(
        (d) =>
          `- [${d.date}] ${d.title} (status: ${d.status})\n  Reasoning: ${d.reasoning}\n  Expected: ${d.expectedOutcome}\n  Risks: ${d.risks.join("; ")}${d.actualOutcome ? `\n  Actual outcome: ${d.actualOutcome}` : ""}`
      )
    );
  }

  if (store.experiments.length) {
    sections.push(
      "EXPERIMENTS (reference past tests):",
      ...store.experiments.slice(0, 6).map(
        (e) =>
          `- [${e.status}] ${e.title}: ${e.hypothesis} → Metric: ${e.successMetric}${e.result ? ` | Result: ${e.result}` : ""}`
      )
    );
  }

  if (store.notes.length) {
    sections.push(
      "STRATEGIC NOTES (feedback, failures, investor context):",
      ...store.notes.slice(0, 8).map(
        (n) => `- [${n.category}] ${n.title}: ${n.content.slice(0, 300)}`
      )
    );
  }

  const latestHealth = store.healthReports[0];
  if (latestHealth) {
    sections.push(
      `LATEST HEALTH SNAPSHOT (${latestHealth.generatedAt}, overall ${latestHealth.overallScore}/10):`,
      ...latestHealth.dimensions.map((d) => `- ${d.name}: ${d.score}/${d.maxScore} — ${d.explanation}`),
      `Blind spots flagged: ${latestHealth.blindSpots.join("; ")}`
    );
  }

  if (!sections.length) {
    return "INSTITUTIONAL MEMORY: Empty — no decisions, experiments, or notes recorded yet.";
  }

  return sections.join("\n\n");
}
