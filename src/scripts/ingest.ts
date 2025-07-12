import fs from "node:fs/promises";
import path from "node:path";
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { supabaseClient } from "@/lib/supabase";

async function main() {
  try {
    // First clear existing documents
    await supabaseClient.from('documents').delete().neq('id', 0);  //default all rows where id is not 0

    // 1‑A. Read .md files
    const dataDir = "src/data/knowledge";    
    const files = await fs.readdir(dataDir);  //read all files in the dataDir
    const mdFiles = files.filter(f => f.endsWith(".md"));

    console.log(`Found ${mdFiles.length} markdown files in ${dataDir}`);

    // Process each file and add metadata
    const docs = [];
    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(dataDir, file), "utf8");  //read the file
      
      // 1-B. Extract metadata from filename
      const category = path.basename(file, ".md").split("-")[0] || "general";
      
      const splitter = new MarkdownTextSplitter ({
        chunkSize: 600,
        chunkOverlap: 80,
      });

      // 1-C. Chunk with metadata
      const fileChunks = await splitter.createDocuments(
        [content],
        [{ 
          source: file,
          category,
          chunk_type: "markdown",
          created_at: new Date().toISOString()
        }]
      );

      console.log(`Processed ${fileChunks.length} chunks from ${file}`);

      docs.push(...fileChunks);
    }

    if (docs.length === 0) {
      console.log("⚠️ No documents found to ingest. Please add .md files to", dataDir);
      return;
    }

    // 1‑D. Embed + store in Supabase
    const embeddings = new OllamaEmbeddings({
        model: "bge-m3",
    });

    console.log(`Embedding ${docs.length} documents...`);

   

    // Store the documents
    const store = await SupabaseVectorStore.fromDocuments(
      docs,
      embeddings,
      {
        client: supabaseClient,
        tableName: 'documents',
        queryName: 'match_documents'
      }
    );

    console.log(`Stored ${store} documents in Supabase`);

    // Verify storage by trying to retrieve a document
    const testQuery = "pricing plans";
    await store.similaritySearchWithScore(testQuery, 1);
    console.log(`Retrieved 1 document for "${testQuery}"`);
  } catch (error) {
    console.error("\nError during ingestion:", error);
    process.exit(1);
  }
}

main();
