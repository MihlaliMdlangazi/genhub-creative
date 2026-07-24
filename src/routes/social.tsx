import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Linkedin,
  Facebook,
  Instagram,
  MessageCircle,
  Twitter,
  Youtube,
  Send,
  Share2,
  Plus,
  Trash2,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title: "Social Publishing — CreatorFlow AI" },
      {
        name: "description",
        content:
          "Connect LinkedIn, Facebook, Instagram, Threads, X, TikTok, YouTube, and Pinterest to publish, schedule, or cross-post content directly from CreatorFlow AI.",
      },
      { property: "og:title", content: "Social Publishing — CreatorFlow AI" },
      {
        property: "og:description",
        content: "Publish, schedule, draft, and cross-post — all from one workspace.",
      },
    ],
  }),
  component: SocialPage,
});

type PlatformId =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "threads"
  | "x"
  | "tiktok"
  | "youtube"
  | "pinterest";

interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  Icon: typeof Linkedin;
  description: string;
}

const PLATFORMS: Platform[] = [
  { id: "linkedin", name: "LinkedIn", color: "text-[#0A66C2]", Icon: Linkedin, description: "Personal profile or company page" },
  { id: "facebook", name: "Facebook Pages", color: "text-[#1877F2]", Icon: Facebook, description: "Publish to your business Page" },
  { id: "instagram", name: "Instagram Business", color: "text-[#E1306C]", Icon: Instagram, description: "Feed posts and carousels" },
  { id: "threads", name: "Threads", color: "text-foreground", Icon: MessageCircle, description: "Text-first conversations" },
  { id: "x", name: "X (Twitter)", color: "text-foreground", Icon: Twitter, description: "Short-form posts and threads" },
  { id: "tiktok", name: "TikTok", color: "text-foreground", Icon: MessageCircle, description: "Short-form video captions" },
  { id: "youtube", name: "YouTube", color: "text-[#FF0000]", Icon: Youtube, description: "Community posts, titles, descriptions" },
  { id: "pinterest", name: "Pinterest", color: "text-[#E60023]", Icon: Share2, description: "Pins and idea boards" },
];

interface ScheduledPost {
  id: string;
  content: string;
  platforms: PlatformId[];
  captions: Partial<Record<PlatformId, string>>;
  status: "draft" | "scheduled" | "published";
  scheduledAt?: number;
  createdAt: number;
}

const K_CONNECTED = "cf.social.connected.v1";
const K_POSTS = "cf.social.posts.v1";

function read<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("cf-social"));
}

function useSocialState<T>(reader: () => T): T {
  const [v, setV] = useState<T>(() => reader());
  useEffect(() => {
    const update = () => setV(reader());
    update();
    window.addEventListener("cf-social", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cf-social", update);
      window.removeEventListener("storage", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

function SocialPage() {
  const connected = useSocialState<PlatformId[]>(() => read(K_CONNECTED, []));
  const posts = useSocialState<ScheduledPost[]>(() => read(K_POSTS, []));

  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<PlatformId[]>([]);
  const [captions, setCaptions] = useState<Partial<Record<PlatformId, string>>>({});
  const [scheduleAt, setScheduleAt] = useState("");
  const [previewFor, setPreviewFor] = useState<PlatformId | null>(null);

  function toggleConnect(id: PlatformId) {
    const next = connected.includes(id) ? connected.filter((p) => p !== id) : [...connected, id];
    write(K_CONNECTED, next);
    toast.success(
      connected.includes(id) ? `Disconnected from ${labelOf(id)}` : `${labelOf(id)} connected`,
    );
  }

  function togglePlatform(id: PlatformId) {
    setSelected((s) => (s.includes(id) ? s.filter((p) => p !== id) : [...s, id]));
  }

  function save(status: "draft" | "scheduled" | "published") {
    if (!draft.trim() && Object.values(captions).every((c) => !c?.trim())) {
      toast.error("Write something to publish first.");
      return;
    }
    if (status !== "draft" && selected.length === 0) {
      toast.error("Select at least one platform.");
      return;
    }
    const post: ScheduledPost = {
      id: Math.random().toString(36).slice(2),
      content: draft,
      platforms: selected,
      captions,
      status,
      scheduledAt: scheduleAt ? new Date(scheduleAt).getTime() : undefined,
      createdAt: Date.now(),
    };
    write(K_POSTS, [post, ...posts]);
    setComposerOpen(false);
    setDraft("");
    setSelected([]);
    setCaptions({});
    setScheduleAt("");
    toast.success(
      status === "draft"
        ? "Saved as draft"
        : status === "scheduled"
          ? "Post scheduled"
          : `Published to ${selected.length} platform${selected.length === 1 ? "" : "s"}`,
    );
  }

  function removePost(id: string) {
    write(
      K_POSTS,
      posts.filter((p) => p.id !== id),
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            Social Publishing
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Connect and publish
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Optional. Link social accounts to publish immediately, schedule for later, save
            drafts, and cross-post to multiple platforms at once.
          </p>
        </div>
        <Button
          onClick={() => setComposerOpen(true)}
          className="bg-gradient-brand text-white hover:opacity-95"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Post
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Connected accounts</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PLATFORMS.map((p) => {
            const isOn = connected.includes(p.id);
            const Icon = p.Icon;
            return (
              <Card key={p.id} className="border p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg border bg-card">
                    <Icon className={cn("h-5 w-5", p.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs">
                    {isOn ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {isOn ? "Connected" : "Not connected"}
                  </span>
                  <Button size="sm" variant={isOn ? "outline" : "default"} onClick={() => toggleConnect(p.id)}>
                    {isOn ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Posts</h2>
        {posts.length === 0 ? (
          <Card className="grid place-items-center border border-dashed p-12 text-center shadow-soft">
            <div>
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <p className="mt-3 text-sm font-medium">Nothing scheduled yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Compose a post to publish now, schedule it, or save as a draft.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className="border p-4 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant={
                          post.status === "published"
                            ? "default"
                            : post.status === "scheduled"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {post.status}
                      </Badge>
                      <span>· {new Date(post.createdAt).toLocaleString()}</span>
                      {post.scheduledAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.scheduledAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm">{post.content}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.platforms.map((pid) => (
                        <Badge key={pid} variant="secondary" className="text-xs">
                          {labelOf(pid)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removePost(post.id)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New post</DialogTitle>
            <DialogDescription>
              Compose once, cross-post everywhere. Edit captions individually per platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What do you want to publish?"
                className="min-h-28"
              />
            </div>

            <div>
              <Label>Platforms</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PLATFORMS.filter((p) => connected.includes(p.id)).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Connect an account above to cross-post.
                  </p>
                )}
                {PLATFORMS.filter((p) => connected.includes(p.id)).map((p) => {
                  const on = selected.includes(p.id);
                  const Icon = p.Icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        on ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", p.color)} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {selected.length > 1 && (
              <div>
                <Label>Per-platform captions (optional)</Label>
                <div className="mt-2 space-y-2">
                  {selected.map((pid) => (
                    <div key={pid}>
                      <p className="mb-1 text-xs text-muted-foreground">{labelOf(pid)}</p>
                      <Textarea
                        value={captions[pid] ?? ""}
                        onChange={(e) =>
                          setCaptions((c) => ({ ...c, [pid]: e.target.value }))
                        }
                        placeholder={`Override caption for ${labelOf(pid)}…`}
                        className="min-h-16"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="when">Schedule (optional)</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                />
              </div>
              <div>
                <Label>Preview</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selected.map((pid) => (
                    <Button
                      key={pid}
                      size="sm"
                      variant={previewFor === pid ? "default" : "outline"}
                      onClick={() => setPreviewFor(previewFor === pid ? null : pid)}
                    >
                      {labelOf(pid)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {previewFor && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Preview — {labelOf(previewFor)}
                </p>
                <p className="whitespace-pre-wrap">{captions[previewFor] || draft}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => save("draft")}>
              Save as Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => save("scheduled")}
              disabled={!scheduleAt}
            >
              <Calendar className="mr-1.5 h-4 w-4" /> Schedule
            </Button>
            <Button
              onClick={() => save("published")}
              className="bg-gradient-brand text-white hover:opacity-95"
            >
              <Send className="mr-1.5 h-4 w-4" /> Publish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function labelOf(id: PlatformId) {
  return PLATFORMS.find((p) => p.id === id)?.name ?? id;
}
