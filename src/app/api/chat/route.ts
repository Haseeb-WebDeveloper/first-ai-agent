import { answer as answerFunction } from "@/lib/rag";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { messages } = body;
    if (!messages || !messages.length) {
      console.error("Missing messages in request");
      return new Response("Messages array is required", { status: 400 });
    }

    return await answerFunction(messages);
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
