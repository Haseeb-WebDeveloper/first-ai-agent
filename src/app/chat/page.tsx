"use client";
import { useChat } from "ai/react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onError: (error) => {
        console.error("Chat error:", error);
      },
      onFinish: (message) => {
        console.log("Chat finished:", message);
      },
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await handleSubmit(e);
  };

  return (
    <div className="flex gap-4 justify-between min-h-screen">
      <div>
        <h1>Chat</h1>
      </div>
      <div className="w-sm flex justify-center items-center h-screen p-2">
        <div className="w-sm bg-foreground/[0.02] flex flex-col justify-center items-center h-[96vh] border border-border rounded-md">
          {/* Header */}
          <div className="w-full text-center bg-background border-b border-border rounded-t-md px-4 py-3">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Image src="/logo.svg" alt="logo" width={40} height={40} />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-none">
                  AI Assistant
                </h1>
                <p className="text-sm">Ask me anything!</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="w-full flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                <h1 className="text-xl font-semibold leading-none">
                  Welcome to AI Assistant
                </h1>
                <p className=" mt-1">Start a conversation about Haseeb</p>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <div key={message.id} className="whitespace-pre-wrap">
                    {message.role === "user" ? "User: " : "AI: "}
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div key={`${message.id}-${i}`}>{part.text}</div>
                          );
                      }
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <Image src="/logo.svg" alt="logo" width={25} height={25} />
                  <div className="">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                    <p className="text-sm text-red-700">
                      Error: {error.message || "Something went wrong"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="w-full bg-background px-4 py-3 rounded-b-md">
            <form
              onSubmit={onSubmit}
              className="flex items-center justify-center space-x-3"
            >
              <div className="w-full h-full flex justify-center items-center">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="w-full h-full resize-none border-[1px] border-foreground/20
                 rounded-md px-3 py-2 pr-12 mb-0 focus:outline-none focus:ring-0 text-sm"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e as any);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-2 h-full rounded-full flex items-center justify-center transition-all duration-200 ${
                  isLoading || !input.trim()
                    ? "bg-foreground/20 cursor-not-allowed"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isLoading ? (
                  <Image
                    src="/loading.svg"
                    alt="loading"
                    width={24}
                    height={24}
                    className="animate-spin"
                  />
                ) : (
                  <Image
                    src="/send.svg"
                    alt="send"
                    width={24}
                    height={24}
                    className={`${isLoading ? "" : "invert"}`}
                  />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
