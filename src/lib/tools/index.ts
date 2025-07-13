import { databaseTool } from './database';

export const tools = {
    search_knowledge_base: databaseTool,
    // Add more tools here as we create them
} as const; 