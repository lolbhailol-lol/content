import OpenAI from "openai";
import { getChatModel, getEmbeddingModel } from "./config";

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://crwdctrl.in",
      "X-Title": process.env.OPENROUTER_APP_NAME || "CrwdCtrl Brain",
    },
  });
}

export async function openrouterEmbedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getClient();
  const model = getEmbeddingModel("openrouter");
  const batchSize = 50;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model,
      input: batch,
      encoding_format: "float",
    });

    const sorted = response.data.sort((a, b) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d) => d.embedding));
  }

  return allEmbeddings;
}

export async function openrouterCompleteChat(options: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}): Promise<string> {
  const client = getClient();
  const model = getChatModel("openrouter");

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.5,
      max_tokens: 2000,
      messages: [
        { role: "system", content: options.systemPrompt },
        ...options.history.map((entry) => ({
          role: entry.role as "user" | "assistant",
          content: entry.content,
        })),
        { role: "user", content: options.message },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenRouter returned an empty response");
    }

    return text;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 429) {
      throw new Error(
        `OpenRouter rate limit on ${model}. Try OPENROUTER_CHAT_MODEL=google/gemini-2.5-flash in .env.local, or wait and retry.`
      );
    }
    throw error;
  }
}
