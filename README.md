# AI Agent - Personal AI Representative

A sophisticated AI agent built with Next.js that serves as Haseeb's personal AI representative. This project implements a RAG (Retrieval Augmented Generation) system with multiple AI providers and advanced tooling capabilities.

## 🚀 Features

- **AI Chat Interface**: Interactive chat with streaming responses
- **RAG System**: Knowledge base integration with vector embeddings
- **Multiple AI Providers**: Support for Groq, OpenAI, Ollama, and XAI
- **Smart Tools**: Database search, email sending, and web search capabilities
- **Knowledge Base**: Markdown-based knowledge ingestion system
- **Vector Database**: Supabase integration for semantic search
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI/ML**: LangChain, AI SDK, Multiple LLM providers
- **Database**: Supabase (Vector embeddings)
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Runtime**: Edge runtime for optimal performance

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/          # Chat API endpoint
│   ├── api/send-mail/     # Email API endpoint
│   ├── chat/              # Chat interface page
│   └── page.tsx           # Home page
├── lib/                   # Core libraries
│   ├── tools/             # AI tools (database, email, web search)
│   ├── ai-config.ts       # AI configuration and prompts
│   ├── rag.ts             # RAG implementation
│   └── supabase.ts        # Supabase client
├── data/knowledge/        # Knowledge base markdown files
└── scripts/
    └── ingest.ts          # Knowledge base ingestion script
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account and project
- AI provider API keys (Groq, OpenAI, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-agent
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure your `.env.local` with:
- Supabase URL and API key
- AI provider API keys
- Email configuration (if using email features)

### Development

1. Start the development server:
```bash
bun dev
# or
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) to view the application

3. Navigate to [http://localhost:3000/chat](http://localhost:3000/chat) for the AI chat interface

### Knowledge Base Setup

1. Add your knowledge base files to `src/data/knowledge/` as markdown files

2. Run the ingestion script to populate the vector database:
```bash
bun run ingest
# or
npm run ingest
```

## 🔧 Configuration

### AI Providers

The system supports multiple AI providers. Configure them in your environment:

- **Groq**: Fast inference with Llama models
- **OpenAI**: GPT models for advanced reasoning
- **Ollama**: Local model deployment
- **XAI**: Grok models

### Tools

The AI agent comes with several built-in tools:

- **Database Search**: Semantic search through the knowledge base
- **Email Sending**: Send emails on behalf of the user
- **Web Search**: Internet search capabilities (configurable)

## 📚 Usage

### Chat Interface

The main chat interface allows users to:
- Ask questions about Haseeb
- Get information from the knowledge base
- Request actions like sending emails
- Engage in natural conversation

### API Endpoints

- `POST /api/chat` - Main chat endpoint with streaming support
- `POST /api/send-mail` - Email sending endpoint

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds

### Other Platforms

```bash
# Build for production
bun run build

# Start production server
bun start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://docs.langchain.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
