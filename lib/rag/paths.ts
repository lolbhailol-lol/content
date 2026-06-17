import { createHash } from "crypto";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

export function getDocsPath(): string {
  if (process.env.DOCS_PATH) {
    return path.resolve(process.cwd(), process.env.DOCS_PATH);
  }
  const brainKb = path.join(process.cwd(), "CrwdCtrl-Brain");
  if (fs.existsSync(brainKb)) {
    return brainKb;
  }
  return process.cwd();
}

export function getBundledIndexPath(): string {
  return path.join(process.cwd(), ".brain", "vector-index.json");
}

/** Writable index path — /tmp on Vercel, .brain locally */
export function getIndexPath(): string {
  if (process.env.BRAIN_INDEX_PATH) {
    return process.env.BRAIN_INDEX_PATH;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "crwdctrl-brain", "vector-index.json");
  }
  return getBundledIndexPath();
}

export function getExcludedDirs(): Set<string> {
  const extra = (process.env.DOCS_EXCLUDE_DIRS || "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  return new Set([
    "node_modules",
    ".next",
    ".git",
    ".brain",
    "app",
    "components",
    "lib",
    "scripts",
    "public",
    "99_ARCHIVE",
    ...extra,
  ]);
}

export async function findMarkdownFiles(dir: string): Promise<string[]> {
  const excluded = getExcludedDirs();
  const results: string[] = [];

  async function walk(current: string) {
    let entries;
    try {
      entries = await fsPromises.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!excluded.has(entry.name)) {
          await walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  await walk(dir);
  return results.sort();
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function extractTitle(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].replace(/^CrwdCtrl\s*[—–-]\s*/i, "").trim();
  return filename.replace(/\.md$/, "").replace(/_/g, " ");
}

export function relativeDocPath(filePath: string, docsPath: string): string {
  return path.relative(docsPath, filePath).replace(/\\/g, "/");
}

export async function ensureBrainDir(): Promise<void> {
  const indexPath = getIndexPath();
  await fsPromises.mkdir(path.dirname(indexPath), { recursive: true });
}
