"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { getModeConfig } from "@/lib/modes";
import { cn } from "@/lib/utils";
import { SourceCitations } from "./SourceCitations";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-[min(100%,20rem)] min-w-0 sm:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {!isUser && message.mode && (
          <p className="mb-1 text-xs text-[var(--muted-foreground)]">
            {getModeConfig(message.mode).label}
          </p>
        )}

        <div
          className={cn(
            "rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm sm:px-4 sm:py-3",
            isUser
              ? "rounded-tr-md bg-[var(--message-user)] text-white"
              : "rounded-tl-md border border-[var(--border)] bg-[var(--message-assistant)] text-[var(--foreground)]"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-body prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}

        <p
          className={cn(
            "mt-1 text-[10px] text-[var(--muted-foreground)]",
            isUser ? "text-right" : "text-left"
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--message-assistant)] px-4 py-4">
        <span className="typing-dot h-2 w-2 rounded-full bg-[var(--muted-foreground)]" />
        <span className="typing-dot h-2 w-2 rounded-full bg-[var(--muted-foreground)]" />
        <span className="typing-dot h-2 w-2 rounded-full bg-[var(--muted-foreground)]" />
      </div>
    </div>
  );
}
