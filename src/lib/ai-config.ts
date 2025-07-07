// Prompt templates
export const PROMPT_TEMPLATES = {
  RAG: `You are a helpful AI assistant. Use ONLY the following context to answer the question. If you're unsure or the context doesn't contain the relevant information, say "I don't know."

Context:
{context}

Question: {question}

Instructions:
1. Answer based ONLY on the provided context
2. If you find the answer in the context, provide it clearly and concisely
3. If the exact answer isn't in the context but you can make a reasonable inference from the context, explain your reasoning

Answer:` 
} as const; 