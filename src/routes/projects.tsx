import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Search, FolderKanban, Type, Code2, ImageIcon, AudioLines } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects, useStore, type GeneratorKind } from "@/lib/store";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — CreatorFlow AI" },
      {
        name: "description",
        content: "Organize generated text, code, images, and audio into projects.",
      },
      { property: "og:title", content: "Projects — CreatorFlow AI" },
      { property: "og:description", content: "Save, sort, and reuse your AI creations." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const list = useStore(() => projects.list());
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "name">("updated");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filtered = list
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "created") return b.createdAt - a.createdAt;
      return b.updatedAt - a.updatedAt;
    });

  const active = openId ? projects.get(openId) : null;

  function createProject() {
    if (!newName.trim()) return;
    projects.create(newName, newDesc);
    setNewName("");
    setNewDesc("");
    setNewOpen(false);
    toast.success("Project created");
  }

  function rename(id: string) {
    const name = prompt("New project name:");
    if (name?.trim()) projects.update(id, { name: name.trim() });
  }

  function remove(id: string) {
    if (confirm("Delete this project? This cannot be undone.")) {
      projects.remove(id);
      if (openId === id) setOpenId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            Projects
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Group generated content into projects to keep everything organized.
          </p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand text-white hover:opacity-95">
              <Plus className="mr-1.5 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new project</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pname">Name</Label>
                <Input id="pname" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Marketing campaign" />
              </div>
              <div>
                <Label htmlFor="pdesc">Description</Label>
                <Textarea id="pdesc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What's this project about?" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button onClick={createProject}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="pl-9" />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="created">Newest first</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="grid place-items-center border border-dashed p-16 text-center shadow-soft">
          <div>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <p className="mt-3 text-base font-medium">No projects yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first project to start organizing generated text, code, images, and audio.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="border p-5 shadow-soft transition hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{p.name}</p>
                  <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{p.description || "No description"}</p>
                </div>
                <Badge variant="secondary">{p.items.length}</Badge>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Updated {new Date(p.updatedAt).toLocaleString()}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setOpenId(p.id)}>
                  Open
                </Button>
                <Button size="sm" variant="ghost" onClick={() => rename(p.id)}>
                  Rename
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p.id)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{active?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {!active || active.items.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                This project has no items yet. Save generations from any generator to add them here.
              </p>
            ) : (
              active.items.map((it) => (
                <div key={it.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <KindIcon kind={it.kind} />
                    <span className="capitalize">{it.kind}</span>
                    <span>· {new Date(it.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">{it.prompt}</p>
                  {it.kind === "image" && it.output.startsWith("data:image") ? (
                    <img src={it.output} className="mt-2 max-h-40 rounded-md border" />
                  ) : it.kind === "audio" && it.output.startsWith("data:audio") ? (
                    <audio className="mt-2 w-full" controls src={it.output} />
                  ) : (
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">{it.output}</pre>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KindIcon({ kind }: { kind: GeneratorKind }) {
  const Icon =
    kind === "text" ? Type : kind === "code" ? Code2 : kind === "image" ? ImageIcon : AudioLines;
  return <Icon className="h-3.5 w-3.5 text-primary" />;
}
