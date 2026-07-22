import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callChat(system: string, user: string, model = "google/gemini-3-flash-preview") {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI error ${res.status}: ${t}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export const Route = createFileRoute("/api/generate-text")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { prompt } = (await request.json()) as { prompt: string };
          if (!prompt?.trim()) return new Response("Missing prompt", { status: 400 });
          const system =
            "You are an expert professional writer for CreatorFlow AI. Return ONLY the finished written content the user asked for. Never return code, images, or audio. Do not include preambles like 'Here is...' or explanations. Use clean Markdown formatting when appropriate.";
          const text = await callChat(system, prompt);
          return Response.json({ text });
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }
      },
    },
  },
});

export { callChat };
