import type { BrainMode, ChatRequest, ChatResponse } from "@/lib/types";
import { completeChat } from "@/lib/ai/chat";
import { isAIConfigured } from "@/lib/ai/config";
import { buildSystemPrompt, buildResponseFormatReminder } from "@/lib/prompts";
import { formatMemoryForContext, loadMemory } from "@/lib/memory/store";
import { processAssistantRecords } from "@/lib/memory/parse-records";
import { buildIndex, isIndexStale, loadIndex } from "@/lib/rag/indexer";
import { retrieveContext } from "@/lib/rag/retriever";
import { isBrainMode } from "@/lib/modes";

export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  if (!isAIConfigured()) {
    throw new Error(
      "No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local"
    );
  }

  if (!request.message?.trim()) {
    throw new Error("Message is required");
  }

  if (!isBrainMode(request.mode)) {
    throw new Error("Invalid mode");
  }

  const mode = request.mode as BrainMode;
  const existingIndex = await loadIndex();
  const wasStale = await isIndexStale(existingIndex);
  await buildIndex(false);

  const { context, citations, indexedFiles } = await retrieveContext(
    request.message,
    8
  );

  const memory = await loadMemory();
  const memoryContext = formatMemoryForContext(memory);

  const systemPrompt = `${buildSystemPrompt(mode, context, memoryContext)}

${buildResponseFormatReminder(mode)}`;

  const historyMessages = (request.history || []).slice(-10).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const rawMessage = await completeChat({
    systemPrompt,
    history: historyMessages,
    message: request.message.trim(),
  });

  const { cleanedMessage, decisionsSaved, experimentsSaved } =
    await processAssistantRecords(rawMessage);

  return {
    message: cleanedMessage,
    sources: citations,
    mode,
    indexedFiles,
    indexFresh: !wasStale,
    recordsSaved: {
      decisions: decisionsSaved.length,
      experiments: experimentsSaved.length,
    },
  };
}
