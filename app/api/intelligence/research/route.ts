import { NextResponse } from "next/server";
import { generateResearchGaps } from "@/lib/intelligence/analyzer";
import {
  intelligenceError,
  intelligenceUnavailable,
} from "@/lib/intelligence/api-utils";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST() {
  const unavailable = intelligenceUnavailable();
  if (unavailable) return unavailable;

  try {
    const report = await generateResearchGaps();
    return NextResponse.json(report);
  } catch (error) {
    return intelligenceError(error);
  }
}
