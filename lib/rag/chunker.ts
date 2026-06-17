import { hashContent } from "./paths";

const TARGET_CHUNK_CHARS = 1200;
const MAX_CHUNK_CHARS = 1800;
const MIN_CHUNK_CHARS = 200;
const OVERLAP_CHARS = 150;

export interface RawChunk {
  section: string;
  content: string;
  hash: string;
}

function splitLongText(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text];

  const parts: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + TARGET_CHUNK_CHARS, text.length);

    if (end < text.length) {
      const breakAt = text.lastIndexOf("\n\n", end);
      if (breakAt > start + MIN_CHUNK_CHARS) {
        end = breakAt;
      } else {
        const sentenceBreak = text.lastIndexOf(". ", end);
        if (sentenceBreak > start + MIN_CHUNK_CHARS) {
          end = sentenceBreak + 1;
        }
      }
    }

    parts.push(text.slice(start, end).trim());
    start = Math.max(end - OVERLAP_CHARS, end);
  }

  return parts.filter((p) => p.length >= MIN_CHUNK_CHARS);
}

export function chunkMarkdown(content: string, filename: string): RawChunk[] {
  const chunks: RawChunk[] = [];
  const lines = content.split("\n");
  let currentSection = extractTitle(content, filename);
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text.length < MIN_CHUNK_CHARS) {
      buffer = [];
      return;
    }

    for (const part of splitLongText(text)) {
      chunks.push({
        section: currentSection,
        content: part,
        hash: hashContent(`${filename}:${currentSection}:${part}`),
      });
    }
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentSection = headingMatch[2].trim();
      buffer.push(line);
    } else {
      buffer.push(line);
    }
  }

  flush();

  if (chunks.length === 0 && content.trim().length > 0) {
    for (const part of splitLongText(content.trim())) {
      chunks.push({
        section: currentSection,
        content: part,
        hash: hashContent(`${filename}:${part}`),
      });
    }
  }

  return chunks;
}

function extractTitle(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return filename.replace(/\.md$/, "");
}
