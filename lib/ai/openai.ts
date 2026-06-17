import OpenAI from "openai";
import { getChatModel, getEmbeddingModel } from "./config";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export async function openaiEmbedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const openai = getClient();
  const model = getEmbeddingModel("openai");
  const batchSize = 50;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model,
      input: batch,
    });

    const sorted = response.data.sort((a, b) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d) => d.embedding));
  }

  return allEmbeddings;
}

export async function openaiCompleteChat(options: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}): Promise<string> {
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model: getChatModel("openai"),
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
    throw new Error("OpenAI returned an empty response");
  }

  return text;
}
