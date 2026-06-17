"use client";

import {
  Briefcase,
  Crown,
  Gavel,
  Layers,
  PenLine,
  TrendingUp,
  Users,
} from "lucide-react";
import { BRAIN_MODES } from "@/lib/modes";
import type { BrainMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = {
  Crown,
  TrendingUp,
  PenLine,
  Layers,
  Briefcase,
  Users,
  Gavel,
} as const;

interface ModeSelectorProps {
  value: BrainMode;
  onChange: (mode: BrainMode) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function ModeSelector({
  value,
  onChange,
  disabled,
  compact,
}: ModeSelectorProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scroll-touch [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        compact ? "flex-nowrap" : "flex-wrap"
      )}
    >
      {BRAIN_MODES.map((mode) => {
        const Icon = ICONS[mode.icon as keyof typeof ICONS] || Crown;
        const active = value === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode.id)}
            title={mode.description}
            aria-label={mode.label}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border text-sm transition-all",
              "min-h-[44px] min-w-[44px] justify-center px-2.5 sm:min-h-0 sm:min-w-0 sm:justify-start sm:gap-2 sm:px-3 sm:py-1.5",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--accent)]"
            )}
          >
            <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            {!compact && <span className="text-xs sm:text-sm">{mode.label}</span>}
            {compact && (
              <span className="hidden text-xs sm:inline sm:text-sm">{mode.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
