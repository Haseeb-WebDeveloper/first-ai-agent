import { store } from "@/scripts/ingest";
import { ChatOpenAI }   from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

const retriever = store.asRetriever({ k: 4 });

export async function answer(question: string) {
  // 1 . retrieve docs
  const docs = await retriever.getRelevantDocuments(question);
  const context = docs.map(d => d.pageContent).join("\n\n");

  // 2 . prompt
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a factual assistant. Answer only from the context below. 
If the context is insufficient, say "I don't know." Cite source numbers in parentheses.

Context:
{context}`
    ],
    ["human", "{question}"]
  ]);

  console.log("prompt", prompt);

  // 3 . call the LLM
  const response = await llm.invoke(
    await prompt.format({ context, question })
  );

  return response.content;
}
