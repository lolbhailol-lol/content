"use client";

import {
  BarChart3,
  Brain,
  MessageSquarePlus,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import type { BrainMode, ChatSession } from "@/lib/types";
import { getModeConfig } from "@/lib/modes";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onReindex: () => void;
  reindexing: boolean;
  indexStats?: { files: number; chunks: number };
  isDark: boolean;
  onToggleTheme: () => void;
  open: boolean;
  onClose: () => void;
  onOpenIntelligence?: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onReindex,
  reindexing,
  indexStats,
  isDark,
  onToggleTheme,
  open,
  onClose,
  onOpenIntelligence,
}: SidebarProps) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] max-w-[85vw] flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] pt-safe pb-safe transition-transform duration-200 lg:static lg:w-72 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--sidebar-border)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                CrwdCtrl Brain
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Strategic co-founder
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New conversation
          </button>

          <button
            type="button"
            onClick={onReindex}
            disabled={reindexing}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", reindexing && "animate-spin")}
            />
            {reindexing ? "Re-indexing..." : "Re-index knowledge base"}
          </button>

          {onOpenIntelligence && (
            <button
              type="button"
              onClick={() => {
                onOpenIntelligence();
                onClose();
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Company intelligence
            </button>
          )}

          {indexStats && (
            <p className="text-center text-[10px] text-[var(--muted-foreground)]">
              {indexStats.files} docs · {indexStats.chunks} chunks indexed
            </p>
          )}
        </div>

        <div className="scroll-touch flex-1 overflow-y-auto px-2 pb-2">
          <p className="px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            History
          </p>
          {sorted.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-[var(--muted-foreground)]">
              No conversations yet
            </p>
          ) : (
            <ul className="space-y-1">
              {sorted.map((session) => (
                <li key={session.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-lg",
                      activeSessionId === session.id && "bg-[var(--muted)]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className="min-w-0 flex-1 px-3 py-2 text-left"
                    >
                      <p className="truncate text-sm text-[var(--foreground)]">
                        {session.title}
                      </p>
                      <p className="truncate text-[10px] text-[var(--muted-foreground)]">
                        {getModeConfig(session.mode).label} ·{" "}
                        {session.messages.length} messages
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="mr-1 rounded p-1.5 text-[var(--muted-foreground)] opacity-0 hover:bg-[var(--background)] hover:text-red-500 group-hover:opacity-100"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--sidebar-border)] p-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" /> Light mode
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" /> Dark mode
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
      aria-label={open ? "Close sidebar" : "Open sidebar"}
    >
      {open ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeftOpen className="h-4 w-4" />
      )}
    </button>
  );
}
