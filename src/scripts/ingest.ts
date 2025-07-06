#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { supabaseClient } from "@/lib/supabase";

// 1‑A. Read .md files
const dataDir = "src/data/knowledge";                      // put your .md files here
const files = await fs.readdir(dataDir);
const mdFiles = files.filter(f => f.endsWith(".md"));

// Process each file and add metadata
const docs = [];
for (const file of mdFiles) {
  const content = await fs.readFile(path.join(dataDir, file), "utf8");
  
  // 1-B. Extract metadata from filename
  const category = path.basename(file, ".md").split("-")[0] || "general";
  
  // 1-C. Chunk with metadata
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50
  });
  
  const fileChunks = await splitter.createDocuments(
    [content],
    [{ 
      source: file,
      category,
      chunk_type: "markdown",
      created_at: new Date().toISOString()
    }]
  );
  
  docs.push(...fileChunks);
}

// 1‑D. Embed + store in Supabase
const embeddings = new OpenAIEmbeddings();

export const store = await SupabaseVectorStore.fromDocuments(
  docs,
  embeddings,
  {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents'
  }
);

console.log(`✅ Ingested ${docs.length} chunks into Supabase`);
console.log("Categories found:", [...new Set(docs.map(d => d.metadata.category))]);
