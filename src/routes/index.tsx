import { createFileRoute, Link } from "@tanstack/react-router";
import { Type, Code2, ImageIcon, AudioLines, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { history, projects, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CreatorFlow AI" },
      {
        name: "description",
        content:
          "Your AI-powered creator studio. Generate text, code, images, and audio in one professional workspace.",
      },
      { property: "og:title", content: "Dashboard — CreatorFlow AI" },
      {
        property: "og:description",
        content: "Your AI-powered creator studio. Generate text, code, images, and audio in one professional workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const CARDS = [
  {
    to: "/text",
    title: "Text Generation",
    desc: "Draft emails, essays, blog posts, and marketing content with a polished tone.",
    icon: Type,
    tint: "from-indigo-500/15 to-blue-500/10",
  },
  {
    to: "/code",
    title: "Code Generation",
    desc: "Ship production-ready code across Java, TypeScript, Python, SQL, and more.",
    icon: Code2,
    tint: "from-sky-500/15 to-indigo-500/10",
  },
  {
    to: "/image",
    title: "Image Generation",
    desc: "Turn a prompt into a unique, high-quality image — logos, ads, illustrations.",
    icon: ImageIcon,
    tint: "from-violet-500/15 to-indigo-500/10",
  },
  {
    to: "/audio",
    title: "Audio Generation",
    desc: "Text-to-speech and speech-to-text for narration, voice-overs, and dictation.",
    icon: AudioLines,
    tint: "from-blue-500/15 to-sky-500/10",
  },
] as const;

function Dashboard() {
  const recentHistory = useStore(() => history.list());
  const projectList = useStore(() => projects.list());

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* Hero */}
      <section className="mb-10 overflow-hidden rounded-3xl border bg-card shadow-soft">
        <div className="relative grid gap-6 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(60% 60% at 85% 10%, oklch(0.85 0.14 268 / .35), transparent 60%), radial-gradient(50% 50% at 10% 90%, oklch(0.85 0.12 240 / .25), transparent 60%)",
            }}
          />
          <div className="relative">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              AI Studio · Open workspace
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Create anything.{" "}
              <span className="text-gradient-brand">Beautifully, in one place.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              CreatorFlow AI brings professional-grade generators for text, code, images, and audio
              into a single, focused workspace. No accounts. No noise. Just your ideas, moving
              forward.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="bg-gradient-brand text-white hover:opacity-95">
                <Link to="/text">
                  Start creating <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/library">Browse prompt library</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 grid grid-cols-2 gap-3 opacity-95">
              {CARDS.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.to}
                    className="rounded-2xl border bg-background/70 p-4 shadow-soft backdrop-blur"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-medium">{c.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Generator cards */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Generators</h2>
          <p className="text-xs text-muted-foreground">Four dedicated studios, one workspace</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Card
                key={c.to}
                className="group relative flex flex-col overflow-hidden border p-5 shadow-soft transition hover:shadow-lift"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.tint}`}
                />
                <div className="relative">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand shadow-lift">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-1.5 min-h-12 text-sm text-muted-foreground">{c.desc}</p>
                  <Button asChild size="sm" variant="ghost" className="mt-3 -ml-2">
                    <Link to={c.to}>
                      Open Generator <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent projects & activity */}
      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card className="border p-5 shadow-soft lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Projects</h3>
            <Button asChild size="sm" variant="ghost">
              <Link to="/projects">View all</Link>
            </Button>
          </div>
          {projectList.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center">
              <p className="text-sm font-medium">No projects yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Generate content and save it to a project to organize your work.
              </p>
              <Button asChild size="sm" className="mt-4" variant="outline">
                <Link to="/projects">Create a project</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projectList.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to="/projects"
                  className="group rounded-xl border p-4 transition hover:border-primary/40 hover:bg-accent/40"
                >
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {p.description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{p.items.length} items</Badge>
                    <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="border p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Activity</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          {recentHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Your generations will appear here after you start creating.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentHistory.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-start gap-3">
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent">
                    {h.kind === "text" && <Type className="h-4 w-4 text-primary" />}
                    {h.kind === "code" && <Code2 className="h-4 w-4 text-primary" />}
                    {h.kind === "image" && <ImageIcon className="h-4 w-4 text-primary" />}
                    {h.kind === "audio" && <AudioLines className="h-4 w-4 text-primary" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
