import { createFileRoute } from "@tanstack/react-router";
import { callChat } from "@/lib/ai.server";

export const Route = createFileRoute("/api/refresh-prompts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { kind } = (await request.json()) as { kind: string };
          const map: Record<string, string> = {
            text: "professional written content (emails, essays, blog posts, marketing copy, documentation, business proposals)",
            code: "software engineering tasks (Java, Spring Boot, React, TypeScript, Python, JavaScript, SQL, HTML, CSS, C#)",
            image: "AI image generation (logos, product ads, character design, UI mockups, illustrations, photographs, cover art)",
            audio: "text-to-speech scripts (podcast intros, voice-overs, narration, ads, educational lessons, meditations)",
          };
          const domain = map[kind] ?? kind;
          const system = `You generate high-quality prompt library suggestions. Reply with STRICT valid JSON only: an array of 6 objects with "title" (2-4 words, Title Case) and "body" (a fully-formed 2-3 sentence prompt a user could paste into a ${kind} generator). No prose, no code fences. Prompts must be for ${domain} and must NOT overlap with other generator domains.`;
          const user = `Return 6 fresh, varied, non-repetitive prompt ideas for the ${kind} generator. Ensure creativity and diversity of use cases.`;
          let raw = await callChat(system, user);
          raw = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
          const parsed = JSON.parse(raw) as Array<{ title: string; body: string }>;
          return Response.json({ prompts: parsed });
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }
      },
    },
  },
});
