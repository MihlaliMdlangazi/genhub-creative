import { createFileRoute } from "@tanstack/react-router";
import { PromptWorkspace } from "@/components/prompt-workspace";

export const Route = createFileRoute("/text")({
  head: () => ({
    meta: [
      { title: "Text Generator — CreatorFlow AI" },
      {
        name: "description",
        content:
          "Generate professional blog posts, emails, essays, documentation, and marketing copy with CreatorFlow AI.",
      },
      { property: "og:title", content: "Text Generator — CreatorFlow AI" },
      {
        property: "og:description",
        content: "AI-crafted written content with a polished, professional tone.",
      },
    ],
  }),
  component: TextPage,
});

function TextPage() {
  return (
    <PromptWorkspace
      kind="text"
      title="Write like a pro"
      subtitle="Blog posts, emails, essays, marketing copy, and documentation — with a confident, human tone."
      placeholder="Describe what you want to write. Include audience, tone, and length for best results…"
      onGenerate={async (prompt) => {
        const res = await fetch("/api/generate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { text: string };
        return { output: data.text };
      }}
      renderOutput={(text) => <MarkdownReader text={text} />}
    />
  );
}

function MarkdownReader({ text }: { text: string }) {
  // Lightweight markdown-ish renderer preserving line breaks.
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <div className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">{text}</div>
    </article>
  );
}
