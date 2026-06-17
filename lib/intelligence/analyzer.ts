import { v4 as uuidv4 } from "uuid";
import { completeChat } from "@/lib/ai/chat";
import {
  formatMemoryForContext,
  loadMemory,
  saveContradictionReport,
  saveHealthReport,
  saveResearchGapReport,
  saveWeeklyReport,
} from "@/lib/memory/store";
import type {
  ContradictionReport,
  HealthReport,
  ResearchGapReport,
  SimulationScenario,
  WeeklyReport,
} from "@/lib/memory/types";
import { buildIndex } from "@/lib/rag/indexer";
import { retrieveContext } from "@/lib/rag/retriever";

function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1) throw new Error("No JSON object in response");
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

async function getFullContext(query: string): Promise<string> {
  await buildIndex(false);
  const { context } = await retrieveContext(query, 12);
  const memory = await loadMemory();
  const memoryContext = formatMemoryForContext(memory);
  return `${context}\n\n---\n\n${memoryContext}`;
}

export async function generateHealthDashboard(): Promise<HealthReport> {
  const context = await getFullContext(
    "CrwdCtrl product growth revenue community content retention GTM strategy metrics traction"
  );

  const raw = await completeChat({
    systemPrompt: `You are CrwdCtrl's strategic intelligence system. Analyze company knowledge and institutional memory. Output ONLY valid JSON, no markdown outside the JSON object.`,
    history: [],
    message: `Evaluate startup health across these dimensions: Product, Growth, Revenue, Distribution, Community, Content, Retention.

Use ONLY documented facts for scores. Be harsh where data is thin.

Company knowledge:
${context}

Return JSON:
{
  "overallScore": number (1-10),
  "dimensions": [{"name":"Product","score":number,"maxScore":10,"explanation":"..."}, ...all 7],
  "blindSpots": ["assumption to challenge", ...],
  "topPriority": "single most important focus"
}`,
  });

  const parsed = extractJson<Omit<HealthReport, "id" | "generatedAt">>(raw);
  const report: HealthReport = {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    ...parsed,
  };
  await saveHealthReport(report);
  return report;
}

export async function generateContradictionReport(): Promise<ContradictionReport> {
  const context = await getFullContext(
    "strategy priorities revenue model GTM growth product vision contradictions conflicts"
  );

  const raw = await completeChat({
    systemPrompt: `You are a strategy auditor for CrwdCtrl. Find conflicts between documents. Output ONLY valid JSON.`,
    history: [],
    message: `Scan for conflicting strategies, priorities, revenue claims, and product statements.

Knowledge:
${context}

Return JSON:
{
  "items": [{
    "area": "topic",
    "conflict": "what contradicts what",
    "sources": ["filename.md", ...],
    "severity": "high|medium|low",
    "recommendation": "how to resolve"
  }]
}`,
  });

  const parsed = extractJson<{ items: ContradictionReport["items"] }>(raw);
  const report: ContradictionReport = {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    items: parsed.items || [],
  };
  await saveContradictionReport(report);
  return report;
}

export async function generateWeeklyReport(): Promise<WeeklyReport> {
  const context = await getFullContext(
    "30 60 90 day plan traction metrics goals priorities wins risks CrwdCtrl weekly"
  );

  const raw = await completeChat({
    systemPrompt: `You are generating the CEO Weekly Report for CrwdCtrl. Be specific. Challenge assumptions. Output ONLY valid JSON.`,
    history: [],
    message: `Generate this week's strategic report based on all company knowledge and memory.

Knowledge:
${context}

Return JSON:
{
  "wins": ["..."],
  "risks": ["..."],
  "missedOpportunities": ["..."],
  "priorities": ["..."],
  "recommendedActions": ["..."]
}`,
  });

  const parsed = extractJson<Omit<WeeklyReport, "id" | "generatedAt">>(raw);
  const report: WeeklyReport = {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    ...parsed,
  };
  await saveWeeklyReport(report);
  return report;
}

export async function generateResearchGaps(): Promise<ResearchGapReport> {
  await buildIndex(false);
  const { context } = await retrieveContext(
    "metrics assumptions validation research missing data",
    10
  );

  const raw = await completeChat({
    systemPrompt: `You are an internal research analyst for CrwdCtrl. Output ONLY valid JSON.`,
    history: [],
    message: `Review indexed company documents. Identify missing research, unvalidated assumptions, and missing metrics.

Documents context:
${context}

Return JSON:
{
  "gaps": [{
    "topic": "...",
    "whyItMatters": "...",
    "suggestedResearch": "specific next step"
  }]
}`,
  });

  const parsed = extractJson<{ gaps: ResearchGapReport["gaps"] }>(raw);
  const report: ResearchGapReport = {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    gaps: parsed.gaps || [],
  };
  await saveResearchGapReport(report);
  return report;
}

export async function simulateDecision(decision: string): Promise<SimulationScenario> {
  const context = await getFullContext(decision);

  const raw = await completeChat({
    systemPrompt: `You simulate strategic decisions for a pre-seed Indian startup (CrwdCtrl). Output ONLY valid JSON. Be realistic about resource constraints.`,
    history: [],
    message: `Simulate this decision for CrwdCtrl: "${decision}"

Context:
${context}

Return JSON:
{
  "decision": "restated decision",
  "bestCase": "...",
  "expectedCase": "...",
  "worstCase": "...",
  "assumptions": ["..."],
  "recommendation": "go / no-go / modify with reason"
}`,
  });

  return extractJson<SimulationScenario>(raw);
}
