import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { DocumentChunk, VectorIndex } from "../types";
import { chunkMarkdown } from "./chunker";
import {
  embedTexts,
  getActiveProvider,
  getEmbeddingModel,
} from "./embeddings";
import {
  ensureBrainDir,
  extractTitle,
  findMarkdownFiles,
  getBundledIndexPath,
  getDocsPath,
  getIndexPath,
  hashContent,
  relativeDocPath,
} from "./paths";

const INDEX_VERSION = 2;

async function readIndexFile(indexPath: string): Promise<VectorIndex | null> {
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    return JSON.parse(raw) as VectorIndex;
  } catch {
    return null;
  }
}

async function seedRuntimeIndexFromBundle(): Promise<VectorIndex | null> {
  if (!process.env.VERCEL) return null;

  const bundled = await readIndexFile(getBundledIndexPath());
  if (!bundled) return null;

  await ensureBrainDir();
  await fs.writeFile(getIndexPath(), JSON.stringify(bundled), "utf-8");
  return bundled;
}

export async function loadIndex(): Promise<VectorIndex | null> {
  const runtime = await readIndexFile(getIndexPath());
  if (runtime) return runtime;

  return seedRuntimeIndexFromBundle();
}

export async function saveIndex(index: VectorIndex): Promise<void> {
  await ensureBrainDir();
  await fs.writeFile(getIndexPath(), JSON.stringify(index), "utf-8");
}

export async function isIndexStale(index: VectorIndex | null): Promise<boolean> {
  if (!index) return true;
  if (index.version !== INDEX_VERSION) return true;

  const provider = getActiveProvider();
  if (provider) {
    const model = getEmbeddingModel(provider);
    if (index.embeddingProvider !== provider || index.embeddingModel !== model) {
      return true;
    }
  }

  const docsPath = getDocsPath();
  if (index.docsPath !== docsPath) return true;

  const files = await findMarkdownFiles(docsPath);

  if (files.length !== Object.keys(index.files).length) return true;

  for (const file of files) {
    const rel = relativeDocPath(file, docsPath);
    const stat = await fs.stat(file);
    const tracked = index.files[rel];
    if (!tracked || tracked.mtimeMs !== stat.mtimeMs) {
      return true;
    }
  }

  return false;
}

export async function buildIndex(force = false): Promise<{
  index: VectorIndex;
  rebuilt: boolean;
  filesIndexed: number;
  chunksCreated: number;
}> {
  const existing = await loadIndex();
  const stale = await isIndexStale(existing);

  if (!force && existing && !stale) {
    return {
      index: existing,
      rebuilt: false,
      filesIndexed: Object.keys(existing.files).length,
      chunksCreated: existing.chunks.length,
    };
  }

  const docsPath = getDocsPath();
  const files = await findMarkdownFiles(docsPath);
  const fileMeta: VectorIndex["files"] = {};
  const rawChunks: Array<{
    file: string;
    title: string;
    section: string;
    content: string;
    hash: string;
  }> = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf-8");
    const stat = await fs.stat(filePath);
    const rel = relativeDocPath(filePath, docsPath);
    const title = extractTitle(content, path.basename(filePath));

    fileMeta[rel] = {
      mtimeMs: stat.mtimeMs,
      hash: hashContent(content),
    };

    const chunks = chunkMarkdown(content, rel);
    for (const chunk of chunks) {
      rawChunks.push({
        file: rel,
        title,
        section: chunk.section,
        content: chunk.content,
        hash: chunk.hash,
      });
    }
  }

  const texts = rawChunks.map(
    (c) => `Document: ${c.file}\nSection: ${c.section}\n\n${c.content}`
  );
  const embeddings = await embedTexts(texts);

  const chunks: DocumentChunk[] = rawChunks.map((chunk, i) => ({
    id: uuidv4(),
    file: chunk.file,
    title: chunk.title,
    section: chunk.section,
    content: chunk.content,
    embedding: embeddings[i],
    hash: chunk.hash,
  }));

  const provider = getActiveProvider();
  const embeddingProvider = provider ?? "unknown";
  const embeddingModel = provider ? getEmbeddingModel(provider) : "unknown";

  const index: VectorIndex = {
    version: INDEX_VERSION,
    builtAt: new Date().toISOString(),
    docsPath,
    embeddingProvider,
    embeddingModel,
    files: fileMeta,
    chunks,
  };

  await saveIndex(index);

  return {
    index,
    rebuilt: true,
    filesIndexed: files.length,
    chunksCreated: chunks.length,
  };
}

export async function ensureFreshIndex(): Promise<VectorIndex> {
  const { index } = await buildIndex(false);
  return index;
}
