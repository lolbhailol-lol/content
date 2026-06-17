"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, BarChart3, Sparkles } from "lucide-react";
import type { BrainMode, ChatMessage, ChatResponse, HealthResponse } from "@/lib/types";
import { DEFAULT_MODE } from "@/lib/modes";
import {
  createSession,
  deriveTitle,
  useChatSessions,
} from "@/lib/chat-storage";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { ChatInput } from "./ChatInput";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { ModeSelector } from "./ModeSelector";
import { Sidebar, SidebarToggle } from "./Sidebar";
import { IntelligencePanel } from "./IntelligencePanel";

const STARTER_PROMPTS: Record<BrainMode, string[]> = {
  ceo: [
    "What should CrwdCtrl prioritize in the next 30 days?",
    "What would an investor challenge about our current strategy?",
    "Compare CrwdCtrl to Townscript and District — what are we missing?",
  ],
  growth: [
    "How do we get our first 20 organizers at MIT-WPU?",
    "What's the campus flywheel and how do we accelerate it?",
    "Design an ambassador program pilot for 3 students.",
  ],
  content: [
    "I pitched a fest organizer today and they said WhatsApp is enough — turn this into content.",
    "We got our first paid registration on CrwdCtrl — help me tell this story without sounding like a guru.",
    "Weak idea check: '5 things I learned building a startup' — make this actually worth posting.",
  ],
  product: [
    "What features are actually live on CrwdCtrl today?",
    "What features do Eventbrite and AllTrails have that we're missing?",
    "What's the biggest retention gap vs Strava Clubs or Discord?",
  ],
  investor: [
    "Write the 30-second investor hook for CrwdCtrl.",
    "What assumptions in our strategy have not been validated?",
    "What would BookMyShow or District do if they entered our market?",
  ],
  sales: [
    "How do I pitch CrwdCtrl to a fest organizer in 2 minutes?",
    "Handle the objection: WhatsApp is free, why pay 3%?",
    "What's the onboarding flow for a new organizer?",
  ],
  board: [
    "Should we spend ₹2 lakh on Pune campus marketing this quarter?",
    "Board review: expand to 3 cities before dominating MIT-WPU?",
    "Challenge our decision to stay bootstrapped vs raising pre-seed now.",
  ],
};

export function ChatInterface() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [sessions, setSessions] = useChatSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<BrainMode>(DEFAULT_MODE);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => null);
  }, [reindexing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (activeSession) {
      setMode(activeSession.mode);
    }
  }, [activeSessionId, activeSession?.mode]);

  const upsertSession = useCallback(
    (sessionId: string, updater: (prev: typeof sessions[0]) => typeof sessions[0]) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updater(s) : s))
      );
    },
    []
  );

  const handleNewChat = () => {
    const session = createSession(mode);
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setInput("");
    setError(null);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setError(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    setError(null);
    try {
      const res = await fetch("/api/reindex?force=true", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reindex failed");
      const healthRes = await fetch("/api/health");
      setHealth(await healthRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reindex failed");
    } finally {
      setReindexing(false);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const session = createSession(mode);
      sessionId = session.id;
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(sessionId);
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      mode,
      createdAt: new Date().toISOString(),
    };

    upsertSession(sessionId, (s) => ({
      ...s,
      mode,
      title: s.messages.length === 0 ? deriveTitle(trimmed) : s.title,
      messages: [...s.messages, userMessage],
      updatedAt: new Date().toISOString(),
    }));

    setInput("");
    setLoading(true);
    setError(null);

    const currentSession = sessions.find((s) => s.id === sessionId);
    const history = [
      ...(currentSession?.messages ?? []),
      userMessage,
    ]
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          mode,
          history: history.slice(0, -1),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat request failed");

      const response = data as ChatResponse;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.message,
        sources: response.sources,
        mode: response.mode,
        createdAt: new Date().toISOString(),
      };

      upsertSession(sessionId, (s) => ({
        ...s,
        messages: [...s.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: BrainMode) => {
    setMode(newMode);
    if (activeSessionId) {
      upsertSession(activeSessionId, (s) => ({ ...s, mode: newMode }));
    }
  };

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-[var(--background)] pt-safe">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onReindex={handleReindex}
        reindexing={reindexing}
        indexStats={
          health
            ? { files: health.indexedFiles, chunks: health.chunks }
            : undefined
        }
        isDark={isDark}
        onToggleTheme={toggleTheme}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenIntelligence={() => {
          setIntelligenceOpen(true);
          setSidebarOpen(false);
        }}
      />

      <IntelligencePanel
        open={intelligenceOpen}
        onClose={() => setIntelligenceOpen(false)}
        onSimulateInChat={(decision) => sendMessage(decision)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-col gap-2 border-b border-[var(--border)] bg-[var(--card)] px-2 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SidebarToggle
              open={sidebarOpen}
              onToggle={() => setSidebarOpen((o) => !o)}
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                {activeSession?.title || "CrwdCtrl Brain"}
              </h1>
              <p className="hidden truncate text-xs text-[var(--muted-foreground)] sm:block">
                Internal docs + external intelligence · RAG-powered
              </p>
            </div>
            {health && !health.aiConfigured && (
              <span className="hidden rounded-full bg-amber-500/10 px-2 py-1 text-[10px] text-amber-600 dark:text-amber-400 sm:inline">
                API key missing
              </span>
            )}
            {health?.aiProvider === "gemini" && (
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-600 dark:text-emerald-400 sm:inline">
                Gemini
              </span>
            )}
            {health?.aiProvider === "openrouter" && (
              <span className="hidden rounded-full bg-violet-500/10 px-2 py-1 text-[10px] text-violet-600 dark:text-violet-400 sm:inline">
                OpenRouter
              </span>
            )}
            <button
              type="button"
              onClick={() => setIntelligenceOpen((o) => !o)}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              title="Company intelligence"
              aria-label="Open company intelligence"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
          <ModeSelector
            value={mode}
            onChange={handleModeChange}
            disabled={loading}
            compact
          />
        </header>

        <div className="scroll-touch flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-3 py-6 sm:px-4 sm:py-8">
              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg sm:mb-4 sm:h-14 sm:w-14">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">
                  Ask CrwdCtrl Brain
                </h2>
                <p className="mt-2 px-1 text-xs text-[var(--muted-foreground)] sm:text-sm">
                  Strategic co-founder with internal docs + industry intelligence.
                  Answers cite sources, challenge assumptions, and include
                  opportunities, risks, and experiments.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-1">
                {STARTER_PROMPTS[mode].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-left text-xs text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--accent)] disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4 px-2 py-4 sm:space-y-6 sm:px-4 sm:py-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="mx-3 mb-2 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 sm:mx-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input)}
          disabled={!health?.aiConfigured}
          loading={loading}
        />
      </main>
    </div>
  );
}
