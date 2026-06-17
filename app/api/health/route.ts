import { NextResponse } from "next/server";
import { getActiveProvider, isAIConfigured } from "@/lib/ai/config";
import { getDocsPath } from "@/lib/rag/paths";
import { getIndexStats } from "@/lib/rag/retriever";
import type { HealthResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getIndexStats();
  const provider = getActiveProvider();
  const configured = isAIConfigured();

  const response: HealthResponse = {
    status: configured && stats.exists ? "ok" : "degraded",
    indexExists: stats.exists,
    indexedFiles: stats.files,
    chunks: stats.chunks,
    aiConfigured: configured,
    aiProvider: provider,
    openaiConfigured: configured,
    docsPath: getDocsPath(),
  };

  return NextResponse.json(response);
}
