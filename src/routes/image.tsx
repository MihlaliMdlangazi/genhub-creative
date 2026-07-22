import { createFileRoute } from "@tanstack/react-router";
import { PromptWorkspace } from "@/components/prompt-workspace";

export const Route = createFileRoute("/image")({
  head: () => ({
    meta: [
      { title: "Image Generator — CreatorFlow AI" },
      {
        name: "description",
        content:
          "Generate unique, high-quality images from a prompt — logos, product ads, illustrations, and UI mockups.",
      },
      { property: "og:title", content: "Image Generator — CreatorFlow AI" },
      {
        property: "og:description",
        content: "One-of-a-kind AI images from a single prompt.",
      },
    ],
  }),
  component: ImagePage,
});

function ImagePage() {
  return (
    <PromptWorkspace
      kind="image"
      title="Unique images from a prompt"
      subtitle="Every prompt creates a fresh, one-of-a-kind image. Describe the scene, mood, and style for best results."
      placeholder="Describe the image. e.g. 'A luxury silver perfume bottle on a matte marble surface, studio lighting…'"
      generateLabel="Generate Image"
      onGenerate={async (prompt) => {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { image: string };
        return { output: data.image };
      }}
      renderOutput={(src) => (
        <div className="flex justify-center">
          <img
            src={src}
            alt="Generated"
            className="max-h-[70vh] w-auto rounded-xl border shadow-lift"
          />
        </div>
      )}
    />
  );
}
