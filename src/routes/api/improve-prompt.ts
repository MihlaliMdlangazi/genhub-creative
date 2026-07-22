import { createFileRoute } from "@tanstack/react-router";
import { callChat } from "./generate-text";

export const Route = createFileRoute("/api/improve-prompt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { prompt, kind } = (await request.json()) as { prompt: string; kind: string };
          if (!prompt?.trim()) return new Response("Missing prompt", { status: 400 });
          const system = `You are a prompt-engineering expert. Rewrite the user's short prompt into a single, richer, more specific prompt tailored for a ${kind} generator. Preserve the user's intent. Add concrete details: audience, tone/style, length or dimensions, format, constraints, and quality bar. Return ONLY the improved prompt as plain text — no preambles, no quotes, no explanations.`;
          const text = await callChat(system, prompt);
          return Response.json({ text: text.trim().replace(/^["']|["']$/g, "") });
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }
      },
    },
  },
});
