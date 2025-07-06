import { answer as answerFunction } from "@/lib/rag";

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return new Response("`message` missing", { status: 400 });

  const answer = await answerFunction(message);

  console.log("answer", answer);

  return Response.json({ answer });
}
