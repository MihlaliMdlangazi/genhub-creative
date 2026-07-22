import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
          const form = await request.formData();
          const file = form.get("file");
          if (!file || !(file instanceof Blob)) {
            return new Response("Missing file", { status: 400 });
          }
          const upstream = new FormData();
          upstream.append("model", "openai/gpt-4o-mini-transcribe");
          const name = (file as File).name || "recording.webm";
          upstream.append("file", file, name);
          const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}` },
            body: upstream,
          });
          if (!res.ok) return new Response(await res.text(), { status: res.status });
          const data = (await res.json()) as { text?: string };
          return Response.json({ text: data.text ?? "" });
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }
      },
    },
  },
});
