import type { DocumentChunk, SourceCitation } from "../types";
import { cosineSimilarity, embedQuery } from "./embeddings";
import { ensureFreshIndex, loadIndex } from "./indexer";

const DEFAULT_TOP_K = 8;
const MIN_SCORE = 0.25;

function scoreChunks(
  queryEmbedding: number[],
  chunks: DocumentChunk[],
  topK: number
): Array<DocumentChunk & { score: number }> {
  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((c) => c.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

function dedupeByFile(
  results: Array<DocumentChunk & { score: number }>
): Array<DocumentChunk & { score: number }> {
  const seen = new Set<string>();
  const deduped: Array<DocumentChunk & { score: number }> = [];

  for (const result of results) {
    const key = `${result.file}:${result.section}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(result);
    }
  }

  return deduped;
}

export function formatContextForPrompt(
  results: Array<DocumentChunk & { score: number }>
): string {
  if (results.length === 0) {
    return "No relevant documents retrieved. Answer from general CrwdCtrl context only and flag gaps.";
  }

  return results
    .map(
      (r, i) =>
        `[${i + 1}] Source: ${r.file} | Section: ${r.section}\n${r.content}`
    )
    .join("\n\n---\n\n");
}

export function toCitations(
  results: Array<DocumentChunk & { score: number }>
): SourceCitation[] {
  return results.map((r) => ({
    file: r.file,
    title: r.title,
    section: r.section,
    excerpt:
      r.content.length > 280 ? r.content.slice(0, 277) + "..." : r.content,
    score: Math.round(r.score * 1000) / 1000,
  }));
}

export async function retrieveContext(
  query: string,
  topK = DEFAULT_TOP_K
): Promise<{
  results: Array<DocumentChunk & { score: number }>;
  context: string;
  citations: SourceCitation[];
  indexedFiles: number;
}> {
  const index = await ensureFreshIndex();
  const queryEmbedding = await embedQuery(query);
  const scored = scoreChunks(queryEmbedding, index.chunks, topK * 2);
  const deduped = dedupeByFile(scored).slice(0, topK);

  return {
    results: deduped,
    context: formatContextForPrompt(deduped),
    citations: toCitations(deduped),
    indexedFiles: Object.keys(index.files).length,
  };
}

export async function getIndexStats() {
  const index = await loadIndex();
  if (!index) {
    return { exists: false, files: 0, chunks: 0, builtAt: null };
  }
  return {
    exists: true,
    files: Object.keys(index.files).length,
    chunks: index.chunks.length,
    builtAt: index.builtAt,
  };
}
