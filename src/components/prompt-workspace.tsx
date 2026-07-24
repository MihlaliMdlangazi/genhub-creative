import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Eraser,
  Sparkles,
  Play,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { seedPrompts, sample, type PromptTemplate } from "@/lib/prompts";
import { history, projects, useStore, type GeneratorKind } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SaveToProjectButton } from "@/components/save-to-project-button";
import { ShareButton } from "@/components/share-dialog";

interface Props {
  kind: GeneratorKind;
  title: string;
  subtitle: string;
  placeholder: string;
  generateLabel?: string;
  onGenerate: (prompt: string) => Promise<{ output: string; meta?: Record<string, string> }>;
  renderOutput: (output: string) => React.ReactNode;
  toolbar?: React.ReactNode;
}

export function PromptWorkspace({
  kind,
  title,
  subtitle,
  placeholder,
  generateLabel = "Generate",
  onGenerate,
  renderOutput,
  toolbar,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState<Record<string, string> | undefined>();
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [library, setLibrary] = useState<PromptTemplate[]>(() => sample(seedPrompts[kind], 6));
  const projectsList = useStore(() => projects.list());
  const taRef = useRef<HTMLTextAreaElement>(null);

  const chars = prompt.length;

  useEffect(() => {
    setLibrary(sample(seedPrompts[kind], 6));
  }, [kind]);

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await onGenerate(prompt);
      setOutput(res.output);
      setMeta(res.meta);
      history.add({ kind, prompt, output: res.output, meta: res.meta });
    } catch (e) {
      toast.error((e as Error).message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function improve() {
    if (!prompt.trim()) {
      toast.error("Write a short prompt to improve.");
      return;
    }
    setImproving(true);
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, kind }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { text: string };
      setPrompt(data.text);
      toast.success("Prompt improved");
    } catch (e) {
      toast.error((e as Error).message || "Improve failed");
    } finally {
      setImproving(false);
    }
  }

  async function refreshLibrary() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/refresh-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompts: PromptTemplate[] };
      setLibrary(data.prompts);
    } catch {
      setLibrary(sample(seedPrompts[kind], 6));
    } finally {
      setRefreshing(false);
    }
  }

  function copyPrompt() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied");
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Output copied");
  }


  function download() {
    if (!output) return;
    let blob: Blob;
    let name: string;
    if (kind === "image" && output.startsWith("data:image")) {
      const b64 = output.split(",")[1];
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      blob = new Blob([bytes], { type: "image/png" });
      name = "creatorflow.png";
    } else if (kind === "audio" && output.startsWith("data:audio")) {
      const b64 = output.split(",")[1];
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      blob = new Blob([bytes], { type: "audio/mpeg" });
      name = "creatorflow.mp3";
    } else {
      blob = new Blob([output], { type: "text/plain" });
      name = kind === "code" ? "creatorflow.txt" : "creatorflow.md";
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kindLabel = useMemo(
    () => ({ text: "Text", code: "Code", image: "Image", audio: "Audio" })[kind],
    [kind],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-2">
            {kindLabel} Generator
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <Card className="border shadow-soft">
            <div className="flex flex-wrap items-center gap-2 border-b p-4">
              <span className="text-sm font-medium">Prompt</span>
              <span className="text-xs text-muted-foreground">{chars} characters</span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {toolbar}
                <Button size="sm" variant="ghost" onClick={() => setPrompt("")}>
                  <Eraser className="mr-1.5 h-4 w-4" /> Clear
                </Button>
                <Button size="sm" variant="ghost" onClick={copyPrompt}>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={improve} disabled={improving}>
                  {improving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1.5 h-4 w-4" />
                  )}
                  Improve Prompt
                </Button>
              </div>
            </div>
            <Textarea
              ref={taRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="min-h-40 resize-y rounded-none border-0 bg-transparent p-4 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-end gap-2 border-t p-3">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-brand text-white hover:opacity-95"
              >
                {loading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-4 w-4" />
                )}
                {generateLabel}
              </Button>
            </div>
          </Card>

          <Card className="border shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-sm font-medium">Output</p>
                <p className="text-xs text-muted-foreground">
                  Generated content appears below.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" onClick={copyOutput} disabled={!output}>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={download} disabled={!output}>
                  <Download className="mr-1.5 h-4 w-4" /> Download
                </Button>
                <SaveToProjectButton
                  kind={kind}
                  generator={`${kindLabel} Generator`}
                  prompt={prompt}
                  output={output}
                  meta={meta}
                  disabled={!output}
                />
                <ShareButton
                  kind={kind}
                  prompt={prompt}
                  output={output}
                  disabled={!output}
                />
              </div>
            </div>
            <div className="p-4 min-h-56">
              {loading ? (
                <OutputSkeleton kind={kind} />
              ) : output ? (
                renderOutput(output)
              ) : (
                <EmptyOutput kind={kind} />
              )}
            </div>
          </Card>
        </div>

        {/* Library column */}
        <aside className="min-w-0 space-y-4">
          <Card className="border shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-sm font-medium">Prompt Library</p>
                <p className="text-xs text-muted-foreground">{kindLabel} presets</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshLibrary}
                disabled={refreshing}
              >
                <RefreshCw
                  className={cn("h-4 w-4", refreshing && "animate-spin")}
                />
              </Button>
            </div>
            <div className="max-h-[520px] space-y-1 overflow-y-auto p-2">
              {library.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p.body)}
                  className="group block w-full rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-accent/60"
                >
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.body}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border p-4 shadow-soft">
            <p className="text-sm font-medium">Recent Projects</p>
            <div className="mt-3 space-y-2">
              {projectsList.slice(0, 4).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Save outputs to organize them into projects.
                </p>
              )}
              {projectsList.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
                >
                  <span className="truncate">{p.name}</span>
                  <Badge variant="secondary">{p.items.length}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function EmptyOutput({ kind }: { kind: GeneratorKind }) {
  const label = { text: "text", code: "code", image: "an image", audio: "audio" }[kind];
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
      <div>
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="mt-3 text-sm font-medium">Ready when you are</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Write a prompt and hit generate to create {label}.
        </p>
      </div>
    </div>
  );
}

function OutputSkeleton({ kind }: { kind: GeneratorKind }) {
  if (kind === "image") {
    return <div className="h-80 w-full animate-pulse rounded-lg bg-muted" />;
  }
  return (
    <div className="space-y-2">
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}
