import { streamText } from 'ai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OllamaEmbeddings } from '@langchain/ollama';
import { supabaseClient } from '@/lib/supabase';
import { PROMPT_TEMPLATES } from './ai-config';
import { groq } from '@ai-sdk/groq';

/* ---------- Vector store (Supabase) ------------------------------------ */
const embeddings = new OllamaEmbeddings({
    model: 'bge-m3',                     
    baseUrl: 'http://localhost:11434',     // default Ollama endpoint
});

const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
});

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export async function answer(
    messages: Message[],
) {
    try {
        console.log('\n=== RAG Query Start ===');
        // Get the last user message
        const lastMessage = messages[messages.length - 1].content;
        console.log('Current question:', lastMessage);

        // Format previous conversation for context
        const conversationHistory = messages
            .slice(0, -1) // Exclude the current message
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');
        
        console.log('Conversation history:', conversationHistory);

        // First verify documents exist
        const { data: docCount, error: countError } = await supabaseClient
            .from('documents')
            .select('count');

        if (countError) {
            console.error("Error checking documents:", countError);
        } else {
            console.log("Documents in database:", docCount);
        }

        /* 1. Try direct similarity search first ---------------------------------- */
        console.log("\nTrying direct similarity search...");
        try {
            // Get documents with scores
            const similarDocs = await vectorStore.similaritySearchWithScore(lastMessage, 4);
            console.log("Similarity search results:", similarDocs.length);
            console.log("Search scores:", similarDocs.map(([_, score]) => score));

            if (similarDocs.length > 0) {
                // Find the highest score
                const maxScore = Math.max(...similarDocs.map(([_, score]) => score));
                console.log("Max similarity score:", maxScore);

                // Only include documents that are within 10% of the highest score
                const scoreThreshold = maxScore - 0.1;
                console.log("Score threshold:", scoreThreshold);

                const relevantDocs = similarDocs
                    .filter(([_, score]) => score >= scoreThreshold)
                    .map(([doc]) => doc);

                console.log('\n=== Retrieved Documents ===');
                console.log('Count:', relevantDocs.length);
                relevantDocs.forEach((doc, i) => {
                    console.log(`\nDocument ${i + 1}:`);
                    console.log('Content:', doc.pageContent);
                    console.log('Metadata:', doc.metadata);
                });

                const context = relevantDocs
                    .map((d) => {
                        const m = d.metadata as Record<string, any>;
                        return `[${m.category ?? 'general'}] ${d.pageContent}`;
                    })
                    .join('\n\n');

                console.log('\n=== Generated Prompt ===');
                const systemPrompt = PROMPT_TEMPLATES.RAG
                    .replace('{context}', context)
                    .replace('{question}', lastMessage);

                // Add conversation history to the prompt
                const fullPrompt = `Previous conversation:\n${conversationHistory}\n\n${systemPrompt}`;
                console.log(fullPrompt);

                const result = await streamText({
                    model: groq('llama3-8b-8192'),      // valid model id
                    messages: [
                        { role: 'system', content: fullPrompt },
                        ...messages.slice(0, -1), // Include previous messages
                        { role: 'user', content: lastMessage }
                    ],
                    temperature: 0,
                });

                console.dir(result, { depth: null });
                console.log('\n=== Response Generated ===' + result.textStream);
                return result.toDataStreamResponse();
            }
        } catch (searchError) {
            console.error("Error during similarity search:", searchError);
        }

        // If no results from similarity search, try with retriever
        console.log("\nTrying retriever search...");
        const retriever = vectorStore.asRetriever({
            k: 2,
            searchType: "similarity",
        });

        const docs = await retriever.getRelevantDocuments(lastMessage);
        console.log("Retriever results:", docs.length);

        let context = '';
        if (docs.length > 0) {
            console.log('\n=== Retrieved Documents ===');
            console.log('Count:', docs.length);
            docs.forEach((doc, i) => {
                console.log(`\nDocument ${i + 1}:`);
                console.log('Content:', doc.pageContent);
                console.log('Metadata:', doc.metadata);
            });

            context = docs
                .map((d) => {
                    const m = d.metadata as Record<string, any>;
                    return `[${m.category ?? 'general'}] ${d.pageContent}`;
                })
                .join('\n\n');
        }

        console.log('\n=== Generated Prompt ===');
        const systemPrompt = PROMPT_TEMPLATES.RAG
            .replace('{context}', context || 'No context available.')
            .replace('{question}', lastMessage);

        // Add conversation history to the prompt
        const fullPrompt = `Previous conversation:\n${conversationHistory}\n\n${systemPrompt}`;
        console.log(fullPrompt);

        const result = await streamText({
            model: groq('llama3-8b-8192'),      // valid model id
            messages: [
                { role: 'system', content: fullPrompt },
                ...messages.slice(0, -1), // Include previous messages
                { role: 'user', content: lastMessage }
            ],
            temperature: 0,
        });

        console.log('\n=== Response Generated ===');
        return result.toDataStreamResponse();
    } catch (error) {
        console.error('\n=== Error in RAG answer ===');
        console.error(error);
        throw error;
    }
}
