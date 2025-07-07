"use client";
import { useChat } from "ai/react";

export default function ChatPage() {
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onFinish: (message) => {
      console.log("Chat finished:", message);
    }
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting with:", { input });  // Debug log
    await handleSubmit(e);
  };

  console.log("messages", messages);

  return (
    <div className="p-6 space-y-4">
     
      <div className="border rounded p-4 h-80 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className="mb-4">
            <p className="font-bold">{m.role === 'user' ? '🧑' : '🤖'}</p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {isLoading && <div className="text-gray-500">AI is thinking...</div>}
        {error && (
          <div className="text-red-500">
            Error: {error.message || "Something went wrong"}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
