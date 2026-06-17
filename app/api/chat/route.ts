import { NextResponse } from "next/server";
import { processChat } from "@/lib/chat-service";
import { isBrainMode } from "@/lib/modes";
import type { ChatRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!body.mode || !isBrainMode(body.mode)) {
      return NextResponse.json({ error: "Valid mode is required" }, { status: 400 });
    }

    const response = await processChat(body);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message.includes("API_KEY") || message.includes("AI provider")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
