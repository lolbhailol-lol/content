import { addDecision, addExperiment } from "./store";
import type { Decision, Experiment } from "./types";

const DECISION_BLOCK = /\[CRWDCTRL_DECISION\]([\s\S]*?)\[\/CRWDCTRL_DECISION\]/g;
const EXPERIMENT_BLOCK = /\[CRWDCTRL_EXPERIMENT\]([\s\S]*?)\[\/CRWDCTRL_EXPERIMENT\]/g;

export interface ParsedChatRecords {
  cleanedMessage: string;
  decisionsSaved: Decision[];
  experimentsSaved: Experiment[];
}

function stripBlocks(message: string): string {
  return message
    .replace(DECISION_BLOCK, "")
    .replace(EXPERIMENT_BLOCK, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function parseDecisionBlock(json: string): Promise<Decision | null> {
  try {
    const data = JSON.parse(json.trim()) as Partial<Decision>;
    if (!data.title || !data.reasoning) return null;

    return addDecision({
      title: data.title,
      reasoning: data.reasoning,
      expectedOutcome: data.expectedOutcome || "Not specified",
      risks: Array.isArray(data.risks) ? data.risks : [data.risks || "Not specified"].flat(),
      date: data.date || new Date().toISOString().slice(0, 10),
      source: "chat",
    });
  } catch {
    return null;
  }
}

async function parseExperimentBlock(json: string): Promise<Experiment | null> {
  try {
    const data = JSON.parse(json.trim()) as Partial<Experiment>;
    if (!data.title || !data.hypothesis) return null;

    return addExperiment({
      title: data.title,
      hypothesis: data.hypothesis,
      expectedOutcome: data.expectedOutcome || "Not specified",
      cost: data.cost || "Not specified",
      risk: data.risk || "Not specified",
      successMetric: data.successMetric || "Not specified",
      date: data.date || new Date().toISOString().slice(0, 10),
      source: "chat",
    });
  } catch {
    return null;
  }
}

export async function processAssistantRecords(
  message: string
): Promise<ParsedChatRecords> {
  const decisionsSaved: Decision[] = [];
  const experimentsSaved: Experiment[] = [];

  const decisionMatches = [...message.matchAll(DECISION_BLOCK)];
  for (const match of decisionMatches) {
    const saved = await parseDecisionBlock(match[1]);
    if (saved) decisionsSaved.push(saved);
  }

  const experimentMatches = [...message.matchAll(EXPERIMENT_BLOCK)];
  for (const match of experimentMatches) {
    const saved = await parseExperimentBlock(match[1]);
    if (saved) experimentsSaved.push(saved);
  }

  return {
    cleanedMessage: stripBlocks(message),
    decisionsSaved,
    experimentsSaved,
  };
}
