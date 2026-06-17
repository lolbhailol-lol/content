export type AIProvider = "gemini" | "openai" | "openrouter";

export function getActiveProvider(): AIProvider | null {
  const forced = process.env.AI_PROVIDER?.toLowerCase();

  if (forced === "openrouter" && process.env.OPENROUTER_API_KEY) {
    return "openrouter";
  }
  if (forced === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (forced === "openai" && process.env.OPENAI_API_KEY) return "openai";

  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.OPENAI_API_KEY) return "openai";

  return null;
}

export function requireProvider(): AIProvider {
  const provider = getActiveProvider();
  if (!provider) {
    throw new Error(
      "No AI provider configured. Set OPENROUTER_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in .env.local"
    );
  }
  return provider;
}

export function isAIConfigured(): boolean {
  return getActiveProvider() !== null;
}

export function getChatModel(provider: AIProvider): string {
  if (provider === "gemini") {
    return process.env.GEMINI_CHAT_MODEL || "gemini-2.0-flash";
  }
  if (provider === "openrouter") {
    return sanitizeEnvModel(
      process.env.OPENROUTER_CHAT_MODEL,
      "google/gemini-2.5-flash"
    );
  }
  return process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
}

export function getEmbeddingModel(provider: AIProvider): string {
  if (provider === "gemini") {
    return process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  }
  if (provider === "openrouter") {
    return sanitizeEnvModel(
      process.env.OPENROUTER_EMBEDDING_MODEL,
      "perplexity/pplx-embed-v1-0.6b"
    );
  }
  return process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
}

export function getProviderLabel(provider: AIProvider): string {
  if (provider === "gemini") return "Google Gemini";
  if (provider === "openrouter") return "OpenRouter";
  return "OpenAI";
}

function sanitizeEnvModel(value: string | undefined, fallback: string): string {
  if (!value?.trim()) return fallback;
  let model = value.trim();
  // Fix accidental duplicate key in .env value
  model = model.replace(/^OPENROUTER_CHAT_MODEL=/, "");
  model = model.replace(/^OPENROUTER_EMBEDDING_MODEL=/, "");
  return model;
}
