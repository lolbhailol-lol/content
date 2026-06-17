export type DecisionStatus = "pending" | "validated" | "failed" | "superseded";
export type ExperimentStatus = "planned" | "running" | "completed" | "cancelled" | "failed";

export type NoteCategory =
  | "failed_idea"
  | "revenue"
  | "community_feedback"
  | "user_feedback"
  | "investor"
  | "experiment_result"
  | "general";

export interface Decision {
  id: string;
  title: string;
  reasoning: string;
  expectedOutcome: string;
  risks: string[];
  date: string;
  status: DecisionStatus;
  actualOutcome?: string;
  source: "chat" | "manual" | "import";
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  expectedOutcome: string;
  cost: string;
  risk: string;
  successMetric: string;
  status: ExperimentStatus;
  result?: string;
  date: string;
  source: "chat" | "manual";
  createdAt: string;
  updatedAt: string;
}

export interface StrategicNote {
  id: string;
  category: NoteCategory;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

export interface HealthDimension {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface HealthReport {
  id: string;
  generatedAt: string;
  overallScore: number;
  dimensions: HealthDimension[];
  blindSpots: string[];
  topPriority: string;
}

export interface ContradictionItem {
  area: string;
  conflict: string;
  sources: string[];
  severity: "high" | "medium" | "low";
  recommendation: string;
}

export interface ContradictionReport {
  id: string;
  generatedAt: string;
  items: ContradictionItem[];
}

export interface WeeklyReport {
  id: string;
  generatedAt: string;
  wins: string[];
  risks: string[];
  missedOpportunities: string[];
  priorities: string[];
  recommendedActions: string[];
}

export interface ResearchGap {
  topic: string;
  whyItMatters: string;
  suggestedResearch: string;
}

export interface ResearchGapReport {
  id: string;
  generatedAt: string;
  gaps: ResearchGap[];
}

export interface SimulationScenario {
  decision: string;
  bestCase: string;
  expectedCase: string;
  worstCase: string;
  assumptions: string[];
  recommendation: string;
}

export interface StrategicMemoryStore {
  decisions: Decision[];
  experiments: Experiment[];
  notes: StrategicNote[];
  healthReports: HealthReport[];
  contradictionReports: ContradictionReport[];
  weeklyReports: WeeklyReport[];
  researchGapReports: ResearchGapReport[];
}

export const EMPTY_MEMORY: StrategicMemoryStore = {
  decisions: [],
  experiments: [],
  notes: [],
  healthReports: [],
  contradictionReports: [],
  weeklyReports: [],
  researchGapReports: [],
};
