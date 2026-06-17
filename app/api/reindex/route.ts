import { NextResponse } from "next/server";
import { buildIndex } from "@/lib/rag/indexer";
import { isAIConfigured } from "@/lib/ai/config";
import type { ReindexResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        {
          error:
            "No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local",
        },
        { status: 503 }
      );
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    const result = await buildIndex(force);

    const response: ReindexResponse = {
      success: true,
      filesIndexed: result.filesIndexed,
      chunksCreated: result.chunksCreated,
      rebuilt: result.rebuilt,
      message: result.rebuilt
        ? `Indexed ${result.filesIndexed} files into ${result.chunksCreated} chunks.`
        : "Index is already up to date.",
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reindex failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await buildIndex(false);
    return NextResponse.json({
      filesIndexed: result.filesIndexed,
      chunksCreated: result.chunksCreated,
      rebuilt: result.rebuilt,
      builtAt: result.index.builtAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Index check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
