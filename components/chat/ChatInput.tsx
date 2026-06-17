"use client";

import { useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  loading,
  placeholder = "Ask CrwdCtrl Brain…",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !loading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--card)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <div className="mx-auto flex max-w-3xl items-end gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-sm focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:ring-opacity-30 sm:gap-2 sm:p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          rows={1}
          placeholder={placeholder}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none disabled:opacity-50 sm:max-h-40 sm:py-2.5 sm:text-sm"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading || !value.trim()}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all sm:h-10 sm:w-10",
            "bg-[var(--primary)] text-[var(--primary-foreground)]",
            "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          )}
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="mx-auto mt-1.5 hidden max-w-3xl text-center text-[10px] text-[var(--muted-foreground)] sm:block">
        CrwdCtrl Brain grounds answers in workspace documents. Shift+Enter for new line.
      </p>
    </div>
  );
}
