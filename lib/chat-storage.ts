import { useCallback, useSyncExternalStore } from "react";
import type { BrainMode, ChatSession } from "./types";

const STORAGE_KEY = "crwdctrl-brain-sessions";
const SESSIONS_EVENT = "crwdctrl-brain-sessions-change";

/** Stable empty snapshot for SSR + hydration (must not allocate new [] each call). */
const SERVER_SNAPSHOT: ChatSession[] = [];

let cachedRaw: string | null = null;
let cachedSessions: ChatSession[] = SERVER_SNAPSHOT;

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(SESSIONS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SESSIONS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getServerSnapshot(): ChatSession[] {
  return SERVER_SNAPSHOT;
}

function readSessionsFromStorage(): ChatSession[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;

  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "";
    if (raw === cachedRaw) return cachedSessions;

    cachedRaw = raw;
    if (!raw) {
      cachedSessions = SERVER_SNAPSHOT;
      return cachedSessions;
    }

    cachedSessions = JSON.parse(raw) as ChatSession[];
    return cachedSessions;
  } catch {
    cachedRaw = "";
    cachedSessions = SERVER_SNAPSHOT;
    return cachedSessions;
  }
}

export function loadSessions(): ChatSession[] {
  return readSessionsFromStorage();
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(sessions);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSessions = sessions;
  window.dispatchEvent(new Event(SESSIONS_EVENT));
}

export function useChatSessions(): [
  ChatSession[],
  (
    value: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])
  ) => void,
] {
  const sessions = useSyncExternalStore(
    subscribe,
    readSessionsFromStorage,
    getServerSnapshot
  );

  const setSessions = useCallback(
    (value: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])) => {
      const prev = readSessionsFromStorage();
      const next = typeof value === "function" ? value(prev) : value;
      saveSessions(next);
    },
    []
  );

  return [sessions, setSessions];
}

export function createSession(mode: BrainMode, title?: string): ChatSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: title || "New conversation",
    mode,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function deriveTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 48) return cleaned;
  return cleaned.slice(0, 45) + "...";
}
