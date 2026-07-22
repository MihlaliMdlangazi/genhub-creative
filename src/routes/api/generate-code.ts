import { createFileRoute } from "@tanstack/react-router";
import { callChat } from "./generate-text";

export const Route = createFileRoute("/api/generate-code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { prompt, language, explain } = (await request.json()) as {
            prompt: string;
            language?: string;
            explain?: boolean;
          };
          if (!prompt?.trim()) return new Response("Missing prompt", { status: 400 });
          const system = explain
            ? `You are a senior software engineer. Produce production-quality ${language ?? "code"} for the user's request, followed by a concise explanation section titled '### Explanation'. Wrap all code in fenced Markdown code blocks with the correct language tag.`
            : `You are a senior software engineer. Produce production-quality ${language ?? "code"} for the user's request. Return ONLY the code, wrapped in a single fenced Markdown code block with the correct language tag. Do NOT include any explanations, commentary, prose, greetings, or apologies. Do NOT return images or audio.`;
          const text = await callChat(system, prompt);
          return Response.json({ text });
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }
      },
    },
  },
});
