import { generateText, streamText } from "ai";
import { cohere } from '@ai-sdk/cohere';
import { tools } from "./tools/tools";
import { PROMPT_TEMPLATES } from "./ai-config";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function answer(messages: Message[]) {
  try {
    const lastMessage = messages[messages.length - 1].content;
    console.log("\n=== Processing New Message ===");
    console.log("User Query:", lastMessage);

    // Format conversation history
    const conversationHistory = messages
      .slice(0, -1)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Create enhanced system prompt for lead conversion
    const systemPrompt = PROMPT_TEMPLATES.SYSTEM_PROMPT.replace(
      "{conversationHistory}",
      conversationHistory
    );

    // Natural conversation prompt that uses tools intelligently
    const enhancedSystemPrompt = `${systemPrompt}

Be natural and conversational. Use tools only when needed:
- Don't call search_knowledge_base if you already have the information from previous searches in this conversation
- Only search when you need specific details about Haseeb that you don't currently know
- Use send_mail when you have a qualified lead with project details AND their contact information (email atleast)
- Focus on natural conversation flow rather than robotic tool usage`;

    // Use streamText with enhanced prompting and tool usage
    const result = await streamText({
      model: cohere("command-r-plus"),
      messages: [
        { role: "system", content: enhancedSystemPrompt },
        { role: "user", content: lastMessage },
      ],
      tools,
      maxSteps: 8, // Increased to allow for knowledge search + response + follow-up
      temperature: 0.1, // Slightly higher for more natural conversation
      toolChoice: "auto", // Let AI decide when to use tools
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("\n=== Error in RAG answer ===");
    console.error(error);
    throw error;
  }
}
