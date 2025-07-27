import { databaseTool } from './database';
import { sendMailTool } from './send-mail';

export const tools = {
    search_knowledge_base: databaseTool,
    send_mail: sendMailTool,
} as const;