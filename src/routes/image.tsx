import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Copy,
  Eraser,
  Sparkles,
  Play,
  RefreshCw,
  Download,
  Loader2,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { seedPrompts, sample, type PromptTemplate } from "@/lib/prompts";
import { history, projects, useStore } from "@/lib/store";
import { streamImage } from "@/lib/stream-image";
import { cn } from "@/lib/utils";
import { SaveToProjectButton } from "@/components/save-to-project-button";
import { ShareButton } from "@/components/share-dialog";

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

const STATUS_MESSAGES = [
  "Generating your image...",
  "Creating your artwork...",
  "Rendering your design...",
  "Applying AI enhancements...",
  "Finalizing your image...",
  "Composing the scene...",
  "Polishing the details...",
];

function pickStatus(prev?: string) {
  let next = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
  if (prev && STATUS_MESSAGES.length > 1) {
    while (next === prev) {
      next = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
    }
  }
  return next;
}

function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string>("");
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [improving, setImproving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [library, setLibrary] = useState<PromptTemplate[]>(() =>
    sample(seedPrompts.image, 6),
  );
  const projectsList = useStore(() => projects.list());
  // Cache: prompt -> final data URL. First run misses, subsequent identical prompts hit.
  const cacheRef = useRef<Map<string, string>>(new Map());
  const lastPromptRef = useRef<string>("");
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chars = prompt.length;

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    };
  }, []);

  async function runGeneration(usedPrompt: string, bypassCache: boolean) {
    if (!usedPrompt.trim()) {
      toast.error("Please enter a prompt first.");
      return;
    }
    const cacheKey = usedPrompt.trim();
    if (!bypassCache) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setImage(cached);
        setIsFinal(true);
        setStatus("");
        lastPromptRef.current = cacheKey;
        toast.success("Loaded from cache");
        return;
      }
    }

    setLoading(true);
    setImage("");
    setIsFinal(false);
    let currentStatus = pickStatus();
    setStatus(currentStatus);
    if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    statusTimerRef.current = setInterval(() => {
      currentStatus = pickStatus(currentStatus);
      setStatus(currentStatus);
    }, 1800);

    try {
      const finalUrl = await streamImage(
        usedPrompt,
        (dataUrl, final) => {
          setImage(dataUrl);
          setIsFinal(final);
        },
      );
      cacheRef.current.set(cacheKey, finalUrl);
      lastPromptRef.current = cacheKey;
      history.add({ kind: "image", prompt: usedPrompt, output: finalUrl });
    } catch (e) {
      toast.error((e as Error).message || "Generation failed");
      setStatus("");
    } finally {
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      statusTimerRef.current = null;
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
        body: JSON.stringify({ prompt, kind: "image" }),
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
        body: JSON.stringify({ kind: "image" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompts: PromptTemplate[] };
      setLibrary(data.prompts);
    } catch {
      setLibrary(sample(seedPrompts.image, 6));
    } finally {
      setRefreshing(false);
    }
  }

  function copyPrompt() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied");
  }

  function saveToProject() {
    if (!image || !isFinal) return;
    const list = projects.list();
    let target = list[0];
    if (!target) target = projects.create("My First Project");
    projects.addItem(target.id, {
      id: Math.random().toString(36).slice(2),
      kind: "image",
      prompt,
      output: image,
      createdAt: Date.now(),
    });
    toast.success(`Saved to "${target.name}"`);
  }

  function shareLinkedIn() {
    const url =
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
      encodeURIComponent(window.location.origin);
    window.open(url, "_blank");
  }

  function download() {
    if (!image || !isFinal) return;
    const b64 = image.split(",")[1];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creatorflow.png";
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateAgain() {
    // Same prompt, force a fresh generation (bypass cache) for a new variation.
    const p = lastPromptRef.current || prompt;
    void runGeneration(p, true);
  }

  const kindLabel = useMemo(() => "Image", []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-2">
            {kindLabel} Generator
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Unique images from a prompt
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every prompt creates a fresh, one-of-a-kind image. Describe the scene,
            mood, and style for best results.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card className="border shadow-soft">
            <div className="flex flex-wrap items-center gap-2 border-b p-4">
              <span className="text-sm font-medium">Prompt</span>
              <span className="text-xs text-muted-foreground">{chars} characters</span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setPrompt("")}>
                  <Eraser className="mr-1.5 h-4 w-4" /> Clear
                </Button>
                <Button size="sm" variant="ghost" onClick={copyPrompt}>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={improve}
                  disabled={improving}
                >
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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image. e.g. 'A luxury silver perfume bottle on a matte marble surface, studio lighting…'"
              className="min-h-40 resize-y rounded-none border-0 bg-transparent p-4 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-end gap-2 border-t p-3">
              <Button
                onClick={() => runGeneration(prompt, false)}
                disabled={loading}
                className="bg-gradient-brand text-white hover:opacity-95"
              >
                {loading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-4 w-4" />
                )}
                Generate Image
              </Button>
            </div>
          </Card>

          <Card className="border shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-sm font-medium">Output</p>
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? status
                    : isFinal
                      ? "Generation complete"
                      : "Generated image appears below."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(image || loading) && lastPromptRef.current && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateAgain}
                    disabled={loading}
                  >
                    <RotateCw className="mr-1.5 h-4 w-4" /> Generate Again
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={download}
                  disabled={!image || !isFinal}
                >
                  <Download className="mr-1.5 h-4 w-4" /> Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveToProject}
                  disabled={!image || !isFinal}
                >
                  <Save className="mr-1.5 h-4 w-4" /> Save to Project
                </Button>
              </div>
            </div>
            <div className="min-h-56 p-4">
              {image ? (
                <ImagePreview src={image} isFinal={isFinal} status={status} />
              ) : loading ? (
                <ImageSkeleton status={status} />
              ) : (
                <EmptyOutput />
              )}
            </div>
            {image && isFinal && (
              <div className="flex flex-wrap items-center gap-2 border-t p-3">
                <span className="text-xs text-muted-foreground">Share</span>
                <Button size="sm" variant="ghost" onClick={shareLinkedIn}>
                  <Linkedin className="mr-1.5 h-4 w-4" /> LinkedIn
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">
                  <Share2 className="mr-1 inline h-3.5 w-3.5" />
                  Shared with your workspace only.
                </span>
              </div>
            )}
          </Card>
        </div>

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
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {p.body}
                  </p>
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

function ImagePreview({
  src,
  isFinal,
  status,
}: {
  src: string;
  isFinal: boolean;
  status: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <img
          src={src}
          alt="Generated"
          className={cn(
            "max-h-[70vh] w-auto rounded-xl border shadow-lift transition-[filter] duration-500",
            isFinal ? "blur-0" : "blur-xl",
          )}
        />
        {!isFinal && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-xl bg-gradient-to-t from-black/40 to-transparent p-4">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {status || "Rendering..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageSkeleton({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-square w-full max-w-[512px] overflow-hidden rounded-xl border bg-muted">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/60 to-muted" />
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand shadow-lift">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium transition-opacity duration-300">
            {status || "Generating your image..."}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyOutput() {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
      <div>
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="mt-3 text-sm font-medium">Ready when you are</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Write a prompt and hit generate to create an image.
        </p>
      </div>
    </div>
  );
}
