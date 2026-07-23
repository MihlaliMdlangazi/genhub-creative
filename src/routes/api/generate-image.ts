import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt: string };
        if (!prompt?.trim()) return new Response("Missing prompt", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-image-2",
            prompt,
            size: "1024x1024",
            quality: "low",
            n: 1,
            stream: true,
            partial_images: 2,
          }),
        });
        if (!upstream.ok || !upstream.body) {
          return new Response(await upstream.text().catch(() => "Image generation failed"), {
            status: upstream.status || 500,
          });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
