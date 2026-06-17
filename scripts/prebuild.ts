import fs from "fs";
import { loadEnvFiles } from "../lib/load-env";
import { buildIndex } from "../lib/rag/indexer";
import { isAIConfigured } from "../lib/ai/config";
import { getBundledIndexPath } from "../lib/rag/paths";

loadEnvFiles();

async function main() {
  if (!isAIConfigured()) {
    console.warn(
      "[prebuild] GEMINI_API_KEY or OPENAI_API_KEY not set — skipping knowledge index."
    );
    return;
  }

  console.log("[prebuild] Building knowledge index...");
  try {
    const result = await buildIndex(true);
    console.log(
      `[prebuild] Indexed ${result.filesIndexed} files, ${result.chunksCreated} chunks.`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const hasExistingIndex = fs.existsSync(getBundledIndexPath());
    console.warn("[prebuild] Index build failed:", message);
    if (hasExistingIndex) {
      console.warn(
        "[prebuild] Using existing .brain/vector-index.json — build will continue."
      );
      return;
    }
    console.warn(
      "[prebuild] No existing index found. Run `npm run reindex` after topping up API credits."
    );
    // Don't block production builds when embedding API is rate-limited or out of credits.
    if (message.includes("429") || message.includes("401") || message.includes("403")) {
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error("[prebuild] Unexpected error:", err);
  process.exit(1);
});
