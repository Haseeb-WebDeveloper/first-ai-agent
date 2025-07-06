"use client";
import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);

  async function send() {
    if (!input) return;
    setLog(l => [...l, "🧑 "+input]);
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
      headers: { "Content-Type": "application/json" }
    });
    const { answer } = await res.json();
    setLog(l => [...l, "🤖 "+answer]);
    setInput("");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="border rounded p-4 h-80 overflow-y-auto">
        {log.map((m,i) => <p key={i} className="whitespace-pre-wrap">{m}</p>)}
      </div>
      <input value={input} onChange={e=>setInput(e.target.value)}
             onKeyDown={e=>e.key==="Enter"&&send()}
             className="border rounded px-3 py-2 w-full"/>
    </div>
  );
}
