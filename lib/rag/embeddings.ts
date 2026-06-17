import {
  getActiveProvider,
  getEmbeddingModel,
  isAIConfigured,
  requireProvider,
} from "@/lib/ai/config";
import { geminiEmbedTexts } from "@/lib/ai/gemini";
import { openaiEmbedTexts } from "@/lib/ai/openai";
import { openrouterEmbedTexts } from "@/lib/ai/openrouter";

export {
  getActiveProvider,
  getChatModel,
  getEmbeddingModel,
  getProviderLabel,
  isAIConfigured,
  requireProvider,
} from "@/lib/ai/config";
export type { AIProvider } from "@/lib/ai/config";

/** @deprecated Use isAIConfigured */
export function isOpenAIConfigured(): boolean {
  return isAIConfigured();
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const provider = requireProvider();

  if (provider === "gemini") {
    return geminiEmbedTexts(texts);
  }
  if (provider === "openrouter") {
    return openrouterEmbedTexts(texts);
  }

  return openaiEmbedTexts(texts);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [embedding] = await embedTexts([query]);
  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function getIndexEmbeddingMeta(): {
  provider: string;
  model: string;
} {
  const provider = requireProvider();
  return {
    provider,
    model: getEmbeddingModel(provider),
  };
}
