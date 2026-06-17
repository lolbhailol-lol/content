import { NextResponse } from "next/server";
import { loadMemory } from "@/lib/memory/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const memory = await loadMemory();
    return NextResponse.json(memory);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
