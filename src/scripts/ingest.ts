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
const mdTexts = await Promise.all(
  files.filter(f => f.endsWith(".md")).map(f => fs.readFile(path.join(dataDir, f), "utf8"))
);

// 1‑B. Chunk
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  chunkOverlap: 50
});
const docs = await splitter.createDocuments(mdTexts);

// 1‑C. Embed + store in Supabase
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
