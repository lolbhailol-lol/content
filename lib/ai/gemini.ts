import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getChatModel,
  getEmbeddingModel,
  requireProvider,
} from "./config";

function getClient(): GoogleGenerativeAI {
  requireProvider();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geminiEmbedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: getEmbeddingModel("gemini"),
  });

  const embeddings: number[][] = [];
  const batchSize = 5;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    for (const text of batch) {
      const result = await model.embedContent(text);
      const values = result.embedding.values;
      if (!values?.length) {
        throw new Error("Gemini returned an empty embedding");
      }
      embeddings.push(Array.from(values));
    }

    if (i + batchSize < texts.length) {
      await sleep(250);
    }
  }

  return embeddings;
}

export async function geminiCompleteChat(options: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: getChatModel("gemini"),
    systemInstruction: options.systemPrompt,
  });

  const history = options.history.map((entry) => ({
    role: entry.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: entry.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(options.message);
  const text = result.response.text()?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}
