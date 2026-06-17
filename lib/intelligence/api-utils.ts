import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/config";

export function intelligenceUnavailable() {
  if (!isAIConfigured()) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local",
      },
      { status: 503 }
    );
  }
  return null;
}

export function intelligenceError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Intelligence request failed";
  return NextResponse.json({ error: message }, { status: 500 });
}
