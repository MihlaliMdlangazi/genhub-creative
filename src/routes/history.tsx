import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2, Copy, RotateCcw, Type, Code2, ImageIcon, AudioLines } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { history, useStore, type GeneratorKind } from "@/lib/store";
import { SaveToProjectButton } from "@/components/save-to-project-button";
import { ShareButton } from "@/components/share-dialog";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — CreatorFlow AI" },
      {
        name: "description",
        content: "Review every prompt and generation. Reuse, copy, save, or delete.",
      },
      { property: "og:title", content: "History — CreatorFlow AI" },
      { property: "og:description", content: "Full history of your AI generations." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const list = useStore(() => history.list());

  function reuse(prompt: string) {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied — paste it into any generator.");
  }


  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            History
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Your generations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every prompt and output, stored locally in your browser.
          </p>
        </div>
        {list.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Clear all history?")) history.clear();
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Clear all
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <Card className="grid place-items-center border border-dashed p-16 text-center shadow-soft">
          <p className="text-base font-medium">No history yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Start generating and your prompts and outputs will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((h) => (
            <Card key={h.id} className="border p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <KindIcon kind={h.kind} />
                    <span className="capitalize">{h.kind}</span>
                    <span>· {new Date(h.createdAt).toLocaleString()}</span>
                    {h.meta?.language && <Badge variant="secondary">{h.meta.language}</Badge>}
                    {h.meta?.voice && <Badge variant="secondary">voice: {h.meta.voice}</Badge>}
                  </div>
                  <p className="mt-2 text-sm font-medium">{h.prompt}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => reuse(h.prompt)}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Reuse
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(h.output);
                      toast.success("Output copied");
                    }}
                  >
                    <Copy className="mr-1.5 h-4 w-4" /> Copy
                  </Button>
                  <SaveToProjectButton
                    kind={h.kind}
                    generator={`${labelFor(h.kind)} Generator`}
                    prompt={h.prompt}
                    output={h.output}
                    meta={h.meta}
                    variant="ghost"
                  />
                  <ShareButton
                    kind={h.kind}
                    prompt={h.prompt}
                    output={h.output}
                    variant="ghost"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => history.remove(h.id)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
              <div className="mt-3">
                {h.kind === "image" && h.output.startsWith("data:image") ? (
                  <img src={h.output} className="max-h-56 rounded-lg border" />
                ) : h.kind === "audio" && h.output.startsWith("data:audio") ? (
                  <audio className="w-full" controls src={h.output} />
                ) : (
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">{h.output}</pre>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function KindIcon({ kind }: { kind: GeneratorKind }) {
  const Icon =
    kind === "text" ? Type : kind === "code" ? Code2 : kind === "image" ? ImageIcon : AudioLines;
  return <Icon className="h-3.5 w-3.5 text-primary" />;
}

function labelFor(kind: GeneratorKind) {
  return { text: "Text", code: "Code", image: "Image", audio: "Audio" }[kind];
}
