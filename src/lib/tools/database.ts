import { tool } from 'ai';
import { z } from 'zod';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OllamaEmbeddings } from '@langchain/ollama';
import { supabaseClient } from '@/lib/supabase';

/* ---------- Vector store setup ------------------------------------ */
const embeddings = new OllamaEmbeddings({
    model: 'bge-m3',                     
    baseUrl: 'http://localhost:11434',
});

const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
});

export const databaseTool = tool({
    description: `Tool for searching specific information about Haseeb in the knowledge base. If user ask anyting that you don't know then use this tool`,
    parameters: z.object({
        query: z.string().describe('The specific information about Haseeb you need to find. Make your query clear and focused.'),
    }),
    async execute({ query }) {
        try {
            console.log("\n=== Database Tool Execution ===");
            console.log("Search query:", query);

            // First verify documents exist
            const { data: docCount, error: countError } = await supabaseClient
                .from('documents')
                .select('count');

            if (countError) {
                console.error("Error checking documents:", countError);
                return "I encountered an error while trying to access Haseeb's information.";
            }

            console.log("Number of documents available:", docCount);

            // Try similarity search
            const similarDocs = await vectorStore.similaritySearchWithScore(query, 4);
            console.log("Number of similar documents found:", similarDocs.length);
            
            if (similarDocs.length > 0) {
                // Find the highest score
                const maxScore = Math.max(...similarDocs.map(([_, score]) => score));
                const scoreThreshold = maxScore - 0.1;
                
                console.log("Max similarity score:", maxScore);
                console.log("Score threshold:", scoreThreshold);

                // Filter and format results
                const results = similarDocs
                    .filter(([_, score]) => score >= scoreThreshold)
                    .map(([doc, score]) => ({
                        content: doc.pageContent,
                        category: doc.metadata.category || 'general',
                        score: score
                    }));

                console.log("Number of relevant results:", results.length);

                if (results.length === 0) {
                    return "I searched but couldn't find any relevant information about that in Haseeb's knowledge base.";
                }

                const formattedResults = results
                    .map(r => `[${r.category}] ${r.content}`)
                    .join('\n\n');

                console.log("Found relevant information:", formattedResults);
                return formattedResults;
            }

            // Fallback to retriever if no good results
            console.log("Falling back to retriever search...");
            const retriever = vectorStore.asRetriever({
                k: 2,
                searchType: "similarity",
            });

            const docs = await retriever.getRelevantDocuments(query);
            console.log("Number of documents from retriever:", docs.length);
            
            if (docs.length === 0) {
                return "I couldn't find any information about that in Haseeb's knowledge base.";
            }

            const formattedDocs = docs
                .map(doc => `[${doc.metadata.category || 'general'}] ${doc.pageContent}`)
                .join('\n\n');

            console.log("Found information from retriever:", formattedDocs);
            return formattedDocs;

        } catch (error) {
            console.error("\n=== Error in Database Tool ===");
            console.error(error);
            return "I encountered an error while searching Haseeb's knowledge base: " + 
                   (error instanceof Error ? error.message : String(error));
        }
    }
});
