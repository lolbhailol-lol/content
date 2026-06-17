export type BrainMode =
  | "ceo"
  | "growth"
  | "content"
  | "product"
  | "investor"
  | "sales"
  | "board";

export interface ModeConfig {
  id: BrainMode;
  label: string;
  description: string;
  icon: string;
  focus: string[];
}

export interface SourceCitation {
  file: string;
  title: string;
  section?: string;
  excerpt: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  mode?: BrainMode;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: BrainMode;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  file: string;
  title: string;
  section: string;
  content: string;
  embedding: number[];
  hash: string;
}

export interface VectorIndex {
  version: number;
  builtAt: string;
  docsPath: string;
  embeddingProvider?: string;
  embeddingModel?: string;
  files: Record<string, { mtimeMs: number; hash: string }>;
  chunks: DocumentChunk[];
}

export interface ChatRequest {
  message: string;
  mode: BrainMode;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatResponse {
  message: string;
  sources: SourceCitation[];
  mode: BrainMode;
  indexedFiles: number;
  indexFresh: boolean;
  recordsSaved?: {
    decisions: number;
    experiments: number;
  };
}

export interface ReindexResponse {
  success: boolean;
  filesIndexed: number;
  chunksCreated: number;
  rebuilt: boolean;
  message: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  indexExists: boolean;
  indexedFiles: number;
  chunks: number;
  aiConfigured: boolean;
  aiProvider: "gemini" | "openai" | "openrouter" | null;
  /** @deprecated use aiConfigured */
  openaiConfigured: boolean;
  docsPath: string;
}
