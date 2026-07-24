import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Mic,
  Square,
  X,
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  Download,
  Sparkles,
  Loader2,
  Copy,
  Eraser,
  RefreshCw,
  AudioLines,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { seedPrompts, sample, type PromptTemplate } from "@/lib/prompts";
import { history, projects, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SaveToProjectButton } from "@/components/save-to-project-button";
import { ShareButton } from "@/components/share-dialog";

export const Route = createFileRoute("/audio")({
  head: () => ({
    meta: [
      { title: "Audio Generator — CreatorFlow AI" },
      {
        name: "description",
        content:
          "Convert text to natural-sounding speech, or record and transcribe your voice into editable text.",
      },
      { property: "og:title", content: "Audio Generator — CreatorFlow AI" },
      {
        property: "og:description",
        content: "Text-to-speech and speech-to-text in one professional audio studio.",
      },
    ],
  }),
  component: AudioPage,
});

const VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"];

function AudioPage() {
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [library, setLibrary] = useState<PromptTemplate[]>(() => sample(seedPrompts.audio, 6));
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const projectList = useStore(() => projects.list());

  // Recording state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    if (!prompt.trim()) {
      toast.error("Type something to narrate.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, voice }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const buf = await blob.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const dataUrl = `data:audio/mpeg;base64,${b64}`;
      setAudioDataUrl(dataUrl);
      history.add({ kind: "audio", prompt, output: dataUrl, meta: { voice } });
      toast.success("Audio generated");
    } catch (e) {
      toast.error((e as Error).message || "Audio generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function improve() {
    if (!prompt.trim()) return;
    setImproving(true);
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, kind: "audio" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { text: string };
      setPrompt(data.text);
    } catch (e) {
      toast.error((e as Error).message);
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
        body: JSON.stringify({ kind: "audio" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompts: PromptTemplate[] };
      setLibrary(data.prompts);
    } catch {
      setLibrary(sample(seedPrompts.audio, 6));
    } finally {
      setRefreshing(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        if (blob.size < 1500) {
          toast.error("Recording was too short. Please try again.");
          return;
        }
        await transcribe(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function cancelRecording() {
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setRecording(false);
    toast.info("Recording canceled");
  }

  async function transcribe(blob: Blob) {
    setTranscribing(true);
    try {
      const fd = new FormData();
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("wav") ? "wav" : "webm";
      fd.append("file", blob, `recording.${ext}`);
      const res = await fetch("/api/stt", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { text: string };
      setPrompt((prev) => (prev ? prev + "\n\n" + data.text : data.text));
      toast.success("Transcribed — edit the text before generating audio.");
    } catch (e) {
      toast.error((e as Error).message || "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }

  function play() {
    audioRef.current?.play();
  }
  function pause() {
    audioRef.current?.pause();
  }
  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }
  function replay() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  function download() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "creatorflow.mp3";
    a.click();
  }

  function saveToProject() {
    if (!audioDataUrl) return;
    const list = projects.list();
    let target = list[0];
    if (!target) target = projects.create("My First Project");
    projects.addItem(target.id, {
      id: Math.random().toString(36).slice(2),
      kind: "audio",
      prompt,
      output: audioDataUrl,
      meta: { voice },
      createdAt: Date.now(),
    });
    toast.success(`Saved to "${target.name}"`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">
          Audio Generator
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Speak, listen, transcribe.
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Convert text to natural speech, or record your voice and turn it into editable text.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {/* Prompt editor */}
          <Card className="border shadow-soft">
            <div className="flex flex-wrap items-center gap-2 border-b p-4">
              <span className="text-sm font-medium">Script</span>
              <span className="text-xs text-muted-foreground">{prompt.length} characters</span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
                  <Label htmlFor="voice" className="text-xs text-muted-foreground">
                    Voice
                  </Label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger id="voice" className="h-7 border-0 shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setPrompt("")}>
                  <Eraser className="mr-1.5 h-4 w-4" /> Clear
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(prompt);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="mr-1.5 h-4 w-4" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={improve} disabled={improving}>
                  {improving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1.5 h-4 w-4" />
                  )}
                  Improve
                </Button>
              </div>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type or paste the exact words to be spoken…"
              className="min-h-40 resize-y rounded-none border-0 bg-transparent p-4 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3">
              <div className="flex flex-wrap items-center gap-2">
                {!recording ? (
                  <Button size="sm" variant="outline" onClick={startRecording} disabled={transcribing}>
                    {transcribing ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Mic className="mr-1.5 h-4 w-4" />
                    )}
                    {transcribing ? "Transcribing…" : "Start Recording"}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="destructive" onClick={stopRecording}>
                      <Square className="mr-1.5 h-4 w-4" /> Stop
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelRecording}>
                      <X className="mr-1.5 h-4 w-4" /> Cancel
                    </Button>
                    <span className="flex items-center gap-1.5 text-xs text-destructive">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                      Recording…
                    </span>
                  </>
                )}
              </div>
              <Button
                onClick={generate}
                disabled={loading}
                className="bg-gradient-brand text-white hover:opacity-95"
              >
                {loading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <AudioLines className="mr-1.5 h-4 w-4" />
                )}
                Generate Audio
              </Button>
            </div>
          </Card>

          {/* Player */}
          <Card className="border shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-sm font-medium">Audio Output</p>
                <p className="text-xs text-muted-foreground">Preview and download</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" onClick={download} disabled={!audioUrl}>
                  <Download className="mr-1.5 h-4 w-4" /> Download
                </Button>
                <Button size="sm" variant="outline" onClick={saveToProject} disabled={!audioDataUrl}>
                  <Save className="mr-1.5 h-4 w-4" /> Save to Project
                </Button>
              </div>
            </div>
            <div className="p-5">
              {audioUrl ? (
                <div className="rounded-xl border bg-gradient-to-br from-indigo-500/5 to-blue-500/5 p-5">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                    className="w-full"
                    controls
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={play} disabled={playing}>
                      <Play className="mr-1.5 h-4 w-4" /> Play
                    </Button>
                    <Button size="sm" variant="outline" onClick={pause} disabled={!playing}>
                      <Pause className="mr-1.5 h-4 w-4" /> Pause
                    </Button>
                    <Button size="sm" variant="outline" onClick={stop}>
                      <StopCircle className="mr-1.5 h-4 w-4" /> Stop
                    </Button>
                    <Button size="sm" variant="outline" onClick={replay}>
                      <RotateCcw className="mr-1.5 h-4 w-4" /> Replay
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-40 place-items-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
                      <AudioLines className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-3 text-sm font-medium">No audio yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Type or dictate a script, then hit Generate Audio.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card className="border shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-sm font-medium">Prompt Library</p>
                <p className="text-xs text-muted-foreground">Audio scripts</p>
              </div>
              <Button size="sm" variant="ghost" onClick={refreshLibrary} disabled={refreshing}>
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
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
              {projectList.slice(0, 4).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Save audio to a project to reuse later.
                </p>
              )}
              {projectList.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
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
