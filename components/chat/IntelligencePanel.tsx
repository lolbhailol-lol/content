"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Brain,
  ChevronRight,
  Loader2,
  Scale,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type {
  ContradictionReport,
  HealthReport,
  ResearchGapReport,
  SimulationScenario,
  StrategicMemoryStore,
  WeeklyReport,
} from "@/lib/memory/types";
import { cn } from "@/lib/utils";

type ScanKind =
  | "health"
  | "contradictions"
  | "weekly"
  | "research"
  | "simulate";

interface IntelligencePanelProps {
  open: boolean;
  onClose: () => void;
  onSimulateInChat?: (decision: string) => void;
}

function scoreColor(score: number, max = 10): string {
  const ratio = score / max;
  if (ratio >= 0.7) return "text-emerald-500";
  if (ratio >= 0.45) return "text-amber-500";
  return "text-red-500";
}

export function IntelligencePanel({
  open,
  onClose,
  onSimulateInChat,
}: IntelligencePanelProps) {
  const [memory, setMemory] = useState<StrategicMemoryStore | null>(null);
  const [loadingMemory, setLoadingMemory] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [contradictions, setContradictions] =
    useState<ContradictionReport | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [research, setResearch] = useState<ResearchGapReport | null>(null);
  const [simulation, setSimulation] = useState<SimulationScenario | null>(null);
  const [simulateInput, setSimulateInput] = useState(
    "We spend ₹2 lakh on campus marketing in Pune."
  );

  const loadMemory = useCallback(async () => {
    setLoadingMemory(true);
    try {
      const res = await fetch("/api/memory");
      if (!res.ok) throw new Error("Failed to load memory");
      setMemory(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memory");
    } finally {
      setLoadingMemory(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMemory();
    }
  }, [open, loadMemory]);

  const runScan = async (kind: ScanKind) => {
    setActiveScan(kind);
    setError(null);

    try {
      if (kind === "simulate") {
        const res = await fetch("/api/intelligence/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: simulateInput }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Simulation failed");
        setSimulation(data);
        return;
      }

      const endpoints: Record<Exclude<ScanKind, "simulate">, string> = {
        health: "/api/intelligence/health",
        contradictions: "/api/intelligence/contradictions",
        weekly: "/api/intelligence/weekly-report",
        research: "/api/intelligence/research",
      };

      const res = await fetch(endpoints[kind], { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      if (kind === "health") setHealth(data);
      if (kind === "contradictions") setContradictions(data);
      if (kind === "weekly") setWeekly(data);
      if (kind === "research") setResearch(data);

      await loadMemory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setActiveScan(null);
    }
  };

  const latestHealth = health || memory?.healthReports[0] || null;

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        onClick={onClose}
        aria-hidden
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--card)] pt-safe pb-safe shadow-xl sm:w-[min(100vw,28rem)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-3 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Company Intelligence</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Strategic memory · scans · simulations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            aria-label="Close intelligence panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scroll-touch flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Startup Health
              </h3>
              <button
                type="button"
                disabled={activeScan === "health"}
                onClick={() => runScan("health")}
                className="text-[10px] text-[var(--primary)] hover:underline disabled:opacity-50"
              >
                {activeScan === "health" ? "Scanning..." : "Refresh"}
              </button>
            </div>

            {activeScan === "health" && !latestHealth ? (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating product, growth, revenue...
              </div>
            ) : latestHealth ? (
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm font-medium">Overall</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      scoreColor(latestHealth.overallScore)
                    )}
                  >
                    {latestHealth.overallScore}/10
                  </span>
                </div>
                <div className="space-y-2">
                  {latestHealth.dimensions.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span>{d.name}</span>
                        <span className={scoreColor(d.score, d.maxScore)}>
                          {d.score}/{d.maxScore}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                        {d.explanation}
                      </p>
                    </div>
                  ))}
                </div>
                {latestHealth.topPriority && (
                  <p className="mt-3 rounded-lg bg-[var(--muted)] px-2 py-1.5 text-[10px]">
                    <span className="font-medium">Top priority:</span>{" "}
                    {latestHealth.topPriority}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">
                Run a health scan to score Product, Growth, Revenue, Distribution,
                Community, Content, and Retention.
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Intelligence Scans
            </h3>
            <div className="grid gap-2">
              {(
                [
                  {
                    id: "contradictions" as const,
                    label: "Contradiction scan",
                    icon: AlertTriangle,
                  },
                  {
                    id: "weekly" as const,
                    label: "CEO weekly report",
                    icon: Target,
                  },
                  {
                    id: "research" as const,
                    label: "Research gaps",
                    icon: Sparkles,
                  },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={!!activeScan}
                  onClick={() => runScan(id)}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2.5 text-left text-sm hover:bg-[var(--muted)] disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    {label}
                  </span>
                  {activeScan === id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {contradictions && contradictions.items.length > 0 && (
            <ScanResult title="Contradictions">
              {contradictions.items.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[var(--border)] p-2 text-[10px]"
                >
                  <p className="font-medium">
                    [{item.severity}] {item.area}
                  </p>
                  <p className="mt-1 text-[var(--muted-foreground)]">
                    {item.conflict}
                  </p>
                </div>
              ))}
            </ScanResult>
          )}

          {weekly && (
            <ScanResult title="CEO Weekly Report">
              <ReportList label="Wins" items={weekly.wins} />
              <ReportList label="Risks" items={weekly.risks} />
              <ReportList label="Priorities" items={weekly.priorities} />
              <ReportList
                label="Recommended actions"
                items={weekly.recommendedActions}
              />
            </ScanResult>
          )}

          {research && research.gaps.length > 0 && (
            <ScanResult title="Research Gaps">
              {research.gaps.slice(0, 5).map((gap, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[var(--border)] p-2 text-[10px]"
                >
                  <p className="font-medium">{gap.topic}</p>
                  <p className="mt-1 text-[var(--muted-foreground)]">
                    {gap.suggestedResearch}
                  </p>
                </div>
              ))}
            </ScanResult>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              <Scale className="h-3 w-3" />
              Future Simulation
            </h3>
            <textarea
              value={simulateInput}
              onChange={(e) => setSimulateInput(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
            />
            <button
              type="button"
              disabled={!!activeScan}
              onClick={() => runScan("simulate")}
              className="mt-2 w-full rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {activeScan === "simulate" ? "Simulating..." : "Run simulation"}
            </button>
            {simulation && (
              <div className="mt-2 space-y-2 text-[10px]">
                <SimBlock title="Best case" text={simulation.bestCase} />
                <SimBlock title="Expected" text={simulation.expectedCase} />
                <SimBlock title="Worst case" text={simulation.worstCase} />
                <p className="rounded-lg bg-[var(--muted)] px-2 py-1.5">
                  <span className="font-medium">Verdict:</span>{" "}
                  {simulation.recommendation}
                </p>
                {onSimulateInChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateInChat(
                        `Simulate this decision in depth: ${simulation.decision}`
                      );
                      onClose();
                    }}
                    className="text-[var(--primary)] hover:underline"
                  >
                    Discuss in chat →
                  </button>
                )}
              </div>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Institutional Memory
              </h3>
              {loadingMemory && (
                <Loader2 className="h-3 w-3 animate-spin text-[var(--muted-foreground)]" />
              )}
            </div>

            {memory && memory.decisions.length > 0 ? (
              <ul className="space-y-2">
                {memory.decisions.slice(0, 6).map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-[10px]"
                  >
                    <p className="font-medium">{d.title}</p>
                    <p className="text-[var(--muted-foreground)]">
                      {d.date} · {d.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">
                Decisions and experiments are captured automatically when discussed
                in chat.
              </p>
            )}

            {memory && memory.experiments.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-[10px] font-medium text-[var(--muted-foreground)]">
                  Recent experiments
                </p>
                <ul className="space-y-1">
                  {memory.experiments.slice(0, 4).map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg bg-[var(--muted)] px-2 py-1 text-[10px]"
                    >
                      {e.title} · {e.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

function ScanResult({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ReportList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium text-[var(--muted-foreground)]">
        {label}
      </p>
      <ul className="list-inside list-disc space-y-0.5 text-[10px]">
        {items.slice(0, 4).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SimBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-2">
      <p className="font-medium">{title}</p>
      <p className="mt-0.5 text-[var(--muted-foreground)]">{text}</p>
    </div>
  );
}
