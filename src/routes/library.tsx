import { createFileRoute, Link } from "@tanstack/react-router";
import { Type, Code2, ImageIcon, AudioLines, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { seedPrompts } from "@/lib/prompts";
import type { GeneratorKind } from "@/lib/store";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Prompt Library — CreatorFlow AI" },
      {
        name: "description",
        content: "Curated prompt templates for text, code, image, and audio generation.",
      },
      { property: "og:title", content: "Prompt Library — CreatorFlow AI" },
      {
        property: "og:description",
        content: "Handpicked prompts to kickstart your next AI creation.",
      },
    ],
  }),
  component: LibraryPage,
});

const SECTIONS: { kind: GeneratorKind; title: string; to: string; Icon: typeof Type }[] = [
  { kind: "text", title: "Text", to: "/text", Icon: Type },
  { kind: "code", title: "Code", to: "/code", Icon: Code2 },
  { kind: "image", title: "Image", to: "/image", Icon: ImageIcon },
  { kind: "audio", title: "Audio", to: "/audio", Icon: AudioLines },
];

function LibraryPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">
          Prompt Library
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Prompts that work</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Handpicked, production-ready prompts for every generator. Refreshable inside each
          generator with the Refresh button.
        </p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map(({ kind, title, to, Icon }) => (
          <section key={kind}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-lift">
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link to={to}>
                  Open {title} Generator <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {seedPrompts[kind].map((p, i) => (
                <Card key={i} className="border p-4 shadow-soft transition hover:shadow-lift">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.body}</p>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
