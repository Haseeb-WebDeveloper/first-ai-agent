import { store } from "@/scripts/ingest";
import { ChatOpenAI }   from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

// Default retriever with no filters
const baseRetriever = store.asRetriever({ k: 4 });

// Retriever with metadata filtering
export async function getFilteredRetriever(filters: Record<string, any>) {
  return store.asRetriever({
    k: 4,
    filter: filters
  });
}

export async function answer(question: string, filters?: Record<string, any>) {
  // 1. Get relevant documents (with optional filtering)
  const retriever = filters ? await getFilteredRetriever(filters) : baseRetriever;
  const docs = await retriever.getRelevantDocuments(question);
  
  // Add metadata to context
  const context = docs.map(d => {
    const meta = d.metadata;
    return `[Source: ${meta.source}, Category: ${meta.category}]\n${d.pageContent}`;
  }).join("\n\n");

  // 2. Enhanced prompt with metadata awareness
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a factual assistant. Answer only from the context below. 
If the context is insufficient, say "I don't know."
Each context chunk includes its source and category - use this to provide more informative answers.
When citing information, mention the source in parentheses.

Context:
{context}`
    ],
    ["human", "{question}"]
  ]);

  console.log("prompt", prompt);

  // 3. Call the LLM
  const response = await llm.invoke(
    await prompt.format({ context, question })
  );

  return response.content;
}
