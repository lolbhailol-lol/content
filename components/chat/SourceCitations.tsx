"use client";

import { FileText } from "lucide-react";
import type { SourceCitation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SourceCitationsProps {
  sources: SourceCitation[];
  className?: string;
}

export function SourceCitations({ sources, className }: SourceCitationsProps) {
  if (!sources.length) return null;

  return (
    <div className={cn("mt-3 space-y-2", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        Sources ({sources.length})
      </p>
      <div className="flex flex-col gap-2">
        {sources.map((source, i) => (
          <div
            key={`${source.file}-${source.section}-${i}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3"
          >
            <div className="mb-1 flex items-start gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {source.title}
                </p>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  {source.file}
                  {source.section ? ` · ${source.section}` : ""}
                  {" · "}
                  relevance {Math.round(source.score * 100)}%
                </p>
              </div>
            </div>
            <p className="line-clamp-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
              {source.excerpt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
