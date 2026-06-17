import { NextResponse } from "next/server";
import { simulateDecision } from "@/lib/intelligence/analyzer";
import {
  intelligenceError,
  intelligenceUnavailable,
} from "@/lib/intelligence/api-utils";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const unavailable = intelligenceUnavailable();
  if (unavailable) return unavailable;

  try {
    const body = (await request.json()) as { decision?: string };
    if (!body.decision?.trim()) {
      return NextResponse.json(
        { error: "decision field is required" },
        { status: 400 }
      );
    }

    const scenario = await simulateDecision(body.decision.trim());
    return NextResponse.json(scenario);
  } catch (error) {
    return intelligenceError(error);
  }
}
