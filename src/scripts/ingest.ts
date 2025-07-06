#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

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

// 1‑C. Embed + store (memory store for now)
const embeddings =
  new OpenAIEmbeddings();               

export const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
console.log(`✅  Ingested ${docs.length} chunks`);
