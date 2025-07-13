import { generateText, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { tools } from "./tools";
import { PROMPT_TEMPLATES } from "./ai-config";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function answer(messages: Message[]) {
  try {
    const lastMessage = messages[messages.length - 1].content;
    console.log("\n=== Processing New Message ===");
    console.log("Last message:", lastMessage);

    // Format conversation history
    const conversationHistory = messages
      .slice(0, -1)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Create a more explicit system prompt
    const systemPrompt = PROMPT_TEMPLATES.SYSTEM_PROMPT.replace(
      "{conversationHistory}",
      conversationHistory
    ).replace("{lastMessage}", lastMessage);

    console.log("\n=== System Prompt ===");
    console.log(systemPrompt);

    // First, let the AI decide if it needs to use tools
    const result = await streamText({
      model: groq("llama3-8b-8192"),
      providerOptions: {
        groq: { reasoningFormat: "parsed" },
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: lastMessage },
      ],
      tools,
      maxSteps: 3,
      temperature: 0,
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("\n=== Error in RAG answer ===");
    console.error(error);
    throw error;
  }
}
