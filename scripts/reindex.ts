#!/usr/bin/env tsx
/**
 * CLI script to build/rebuild the knowledge index.
 * Usage: npm run reindex
 * Force rebuild: npm run reindex -- --force
 */

import { loadEnvFiles } from "../lib/load-env";
import { buildIndex } from "../lib/rag/indexer";
import { isAIConfigured } from "../lib/ai/config";
import { getDocsPath } from "../lib/rag/paths";

loadEnvFiles();

async function main() {
  const force = process.argv.includes("--force");

  if (!isAIConfigured()) {
    console.error(
      "Error: Set GEMINI_API_KEY (free) or OPENAI_API_KEY in .env.local"
    );
    process.exit(1);
  }

  console.log(`Docs path: ${getDocsPath()}`);
  console.log(force ? "Force rebuilding index..." : "Building index if stale...");

  const result = await buildIndex(force);

  console.log(`Files indexed: ${result.filesIndexed}`);
  console.log(`Chunks created: ${result.chunksCreated}`);
  console.log(`Rebuilt: ${result.rebuilt}`);
  console.log(`Built at: ${result.index.builtAt}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
