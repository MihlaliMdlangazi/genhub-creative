import { createFileRoute } from "@tanstack/react-router";
import { callChat } from "@/lib/ai.server";

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
