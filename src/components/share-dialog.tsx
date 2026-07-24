import { useState } from "react";
import { toast } from "sonner";
import {
  Share2,
  Copy,
  Link as LinkIcon,
  Mail,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Send,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { GeneratorKind } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  kind: GeneratorKind;
  prompt: string;
  output: string;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

type PlatformId =
  | "linkedin"
  | "x"
  | "facebook"
  | "instagram"
  | "threads"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "whatsapp"
  | "telegram"
  | "discord"
  | "reddit"
  | "medium"
  | "tumblr"
  | "bluesky"
  | "email"
  | "copylink"
  | "github";

interface Platform {
  id: PlatformId;
  label: string;
  Icon: typeof Share2;
  color: string;
  kinds?: GeneratorKind[]; // limit to certain kinds
  optimize?: (text: string) => string;
}

const PLATFORMS: Platform[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    Icon: Linkedin,
    color: "text-[#0A66C2]",
    optimize: (t) => t.trim(),
  },
  {
    id: "x",
    label: "X (Twitter)",
    Icon: Twitter,
    color: "text-foreground",
    optimize: (t) => (t.length > 275 ? t.slice(0, 272).trimEnd() + "…" : t),
  },
  { id: "facebook", label: "Facebook", Icon: Facebook, color: "text-[#1877F2]" },
  {
    id: "instagram",
    label: "Instagram",
    Icon: Instagram,
    color: "text-[#E1306C]",
    optimize: (t) => `${t}\n\n#creatorflow #ai #content`,
  },
  { id: "threads", label: "Threads", Icon: MessageCircle, color: "text-foreground" },
  { id: "tiktok", label: "TikTok", Icon: MessageCircle, color: "text-foreground" },
  {
    id: "youtube",
    label: "YouTube",
    Icon: Youtube,
    color: "text-[#FF0000]",
    kinds: ["text", "audio"],
    optimize: (t) => `Title: ${t.split("\n")[0].slice(0, 90)}\n\nDescription:\n${t}`,
  },
  { id: "pinterest", label: "Pinterest", Icon: Share2, color: "text-[#E60023]" },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle, color: "text-[#25D366]" },
  { id: "telegram", label: "Telegram", Icon: Send, color: "text-[#229ED9]" },
  { id: "discord", label: "Discord", Icon: MessageCircle, color: "text-[#5865F2]" },
  { id: "reddit", label: "Reddit", Icon: Share2, color: "text-[#FF4500]" },
  { id: "medium", label: "Medium", Icon: Share2, color: "text-foreground" },
  { id: "tumblr", label: "Tumblr", Icon: Share2, color: "text-[#001935]" },
  { id: "bluesky", label: "Bluesky", Icon: Share2, color: "text-[#0085FF]" },
  { id: "email", label: "Email", Icon: Mail, color: "text-foreground" },
  { id: "copylink", label: "Copy Link", Icon: LinkIcon, color: "text-foreground" },
  {
    id: "github",
    label: "Publish to GitHub",
    Icon: Github,
    color: "text-foreground",
    kinds: ["code"],
  },
];

function toShareText(kind: GeneratorKind, prompt: string, output: string): string {
  if (kind === "image") {
    return `Generated with CreatorFlow AI — prompt: ${prompt}`;
  }
  if (kind === "audio") {
    return `Audio generated with CreatorFlow AI — script: ${prompt}`;
  }
  if (kind === "code") {
    return "```\n" + output + "\n```";
  }
  return output;
}

async function nativeShare(kind: GeneratorKind, text: string, output: string) {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  try {
    if (kind === "image" && output.startsWith("data:image")) {
      const blob = await (await fetch(output)).blob();
      const file = new File([blob], "creatorflow.png", { type: blob.type });
      const nav = navigator as Navigator & {
        canShare?: (d: { files?: File[] }) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text } as ShareData);
        return true;
      }
    }
    if (kind === "audio" && output.startsWith("data:audio")) {
      const blob = await (await fetch(output)).blob();
      const file = new File([blob], "creatorflow.mp3", { type: blob.type });
      const nav = navigator as Navigator & {
        canShare?: (d: { files?: File[] }) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text } as ShareData);
        return true;
      }
    }
    await navigator.share({ text, url: window.location.origin });
    return true;
  } catch {
    return false;
  }
}

function openWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ShareButton({
  kind,
  prompt,
  output,
  disabled,
  size = "sm",
  variant = "outline",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>(() => toShareText(kind, prompt, output));

  // Refresh caption when opening
  function handleOpen(next: boolean) {
    if (next) setText(toShareText(kind, prompt, output));
    setOpen(next);
  }

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function share(p: Platform) {
    const optimized = p.optimize ? p.optimize(text) : text;
    const enc = encodeURIComponent(optimized);
    const urlEnc = encodeURIComponent(shareUrl);

    switch (p.id) {
      case "copylink":
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied");
        return;
      case "linkedin":
        openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${urlEnc}`);
        await navigator.clipboard.writeText(optimized).catch(() => {});
        toast.success("Caption copied — paste into LinkedIn");
        return;
      case "x":
        openWindow(`https://twitter.com/intent/tweet?text=${enc}&url=${urlEnc}`);
        return;
      case "facebook":
        openWindow(`https://www.facebook.com/sharer/sharer.php?u=${urlEnc}&quote=${enc}`);
        return;
      case "reddit":
        openWindow(`https://www.reddit.com/submit?title=${enc}&url=${urlEnc}`);
        return;
      case "telegram":
        openWindow(`https://t.me/share/url?url=${urlEnc}&text=${enc}`);
        return;
      case "whatsapp":
        openWindow(`https://api.whatsapp.com/send?text=${enc}%20${urlEnc}`);
        return;
      case "pinterest":
        openWindow(
          `https://pinterest.com/pin/create/button/?url=${urlEnc}&description=${enc}${
            kind === "image" && output.startsWith("data:image") ? "" : ""
          }`,
        );
        return;
      case "tumblr":
        openWindow(`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${urlEnc}&caption=${enc}`);
        return;
      case "email":
        openWindow(
          `mailto:?subject=${encodeURIComponent("From CreatorFlow AI")}&body=${enc}%0A%0A${urlEnc}`,
        );
        return;
      case "bluesky":
        openWindow(`https://bsky.app/intent/compose?text=${enc}`);
        return;
      case "medium":
      case "tumblr":
      case "instagram":
      case "threads":
      case "tiktok":
      case "discord":
      case "youtube": {
        const ok = await nativeShare(kind, optimized, output);
        if (!ok) {
          await navigator.clipboard.writeText(optimized).catch(() => {});
          toast.success(`Caption copied — open ${p.label} to paste`);
        }
        return;
      }
      case "github":
        openWindow("https://github.com/new");
        await navigator.clipboard.writeText(output).catch(() => {});
        toast.success("Code copied — paste into your new GitHub repo");
        return;
    }
  }

  function downloadMedia() {
    if (!output) return;
    let blob: Blob;
    let name: string;
    if (kind === "image" && output.startsWith("data:image")) {
      const bytes = Uint8Array.from(atob(output.split(",")[1]), (c) => c.charCodeAt(0));
      blob = new Blob([bytes], { type: "image/png" });
      name = "creatorflow.png";
    } else if (kind === "audio" && output.startsWith("data:audio")) {
      const bytes = Uint8Array.from(atob(output.split(",")[1]), (c) => c.charCodeAt(0));
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

  const platforms = PLATFORMS.filter((p) => !p.kinds || p.kinds.includes(kind));

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => handleOpen(true)}
        disabled={disabled || !output}
        className={className}
      >
        <Share2 className="mr-1.5 h-4 w-4" /> Share
      </Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share your generation</DialogTitle>
            <DialogDescription>
              Caption is optimized per platform. Formatting, paragraphs, and Markdown are preserved.
            </DialogDescription>
          </DialogHeader>

          {kind !== "image" && kind !== "audio" && (
            <div className="space-y-2">
              <Label htmlFor="cap">Caption</Label>
              <Textarea
                id="cap"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-28"
              />
              <p className="text-xs text-muted-foreground">
                {text.length} characters · edited caption is used for every platform below.
              </p>
            </div>
          )}

          {kind === "image" && output.startsWith("data:image") && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <img src={output} alt="preview" className="h-16 w-16 rounded-md object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Image ready to share</p>
                <p className="truncate text-xs text-muted-foreground">{prompt}</p>
              </div>
            </div>
          )}

          {kind === "audio" && output.startsWith("data:audio") && (
            <div className="rounded-lg border p-3">
              <audio controls src={output} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {platforms.map((p) => {
              const Icon = p.Icon;
              return (
                <button
                  key={p.id}
                  onClick={() => share(p)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition hover:border-primary hover:bg-accent",
                  )}
                >
                  <Icon className={cn("h-5 w-5", p.color)} />
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="ghost" onClick={downloadMedia}>
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const t =
                  kind === "text" || kind === "code" ? output : toShareText(kind, prompt, output);
                await navigator.clipboard.writeText(t);
                toast.success("Copied");
              }}
            >
              <Copy className="mr-1.5 h-4 w-4" /> Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
