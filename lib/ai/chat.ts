import { requireProvider } from "./config";
import { geminiCompleteChat } from "./gemini";
import { openaiCompleteChat } from "./openai";
import { openrouterCompleteChat } from "./openrouter";

export async function completeChat(options: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}): Promise<string> {
  const provider = requireProvider();

  if (provider === "gemini") {
    return geminiCompleteChat(options);
  }
  if (provider === "openrouter") {
    return openrouterCompleteChat(options);
  }

  return openaiCompleteChat(options);
}
