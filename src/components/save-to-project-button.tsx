import { useState } from "react";
import { toast } from "sonner";
import { Save, Plus, FolderKanban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projects, settings, useStore, uid, type HistoryEntry, type GeneratorKind } from "@/lib/store";

interface Props {
  kind: GeneratorKind;
  generator: string; // e.g. "Text Generator"
  prompt: string;
  output: string;
  meta?: Record<string, string>;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function SaveToProjectButton({
  kind,
  generator,
  prompt,
  output,
  meta,
  disabled,
  size = "sm",
  variant = "outline",
  className,
}: Props) {
  const projectList = useStore(() => projects.list());
  const config = useStore(() => settings.get());
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const selected =
    (config.selectedProjectId && projectList.find((p) => p.id === config.selectedProjectId)) ||
    null;

  function buildEntry(): HistoryEntry {
    const now = Date.now();
    return {
      id: uid(),
      kind,
      prompt,
      output,
      meta,
      generator,
      createdAt: now,
      updatedAt: now,
    };
  }

  function saveInto(projectId: string, projectName: string) {
    projects.addItem(projectId, buildEntry());
    toast.success(`Saved to "${projectName}"`, {
      description: `${generator} · ${new Date().toLocaleString()}`,
    });
  }

  function handleClick() {
    if (!output) return;
    if (selected) {
      saveInto(selected.id, selected.name);
      return;
    }
    setOpen(true);
  }

  function pickExisting(id: string, name: string) {
    settings.set({ selectedProjectId: id });
    saveInto(id, name);
    setOpen(false);
  }

  function createAndSave() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const p = projects.create(name);
      settings.set({ selectedProjectId: p.id });
      saveInto(p.id, p.name);
      setNewName("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={handleClick}
        disabled={disabled || !output}
        className={className}
      >
        <Save className="mr-1.5 h-4 w-4" />
        {selected ? `Save to ${truncate(selected.name, 18)}` : "Save to Project"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save to a project</DialogTitle>
            <DialogDescription>
              Choose a project to save this generation into, or create a new one.
            </DialogDescription>
          </DialogHeader>

          {projectList.length > 0 && (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-1">
              {projectList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickExisting(p.id, p.name)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      · {p.items.length}
                    </span>
                  </span>
                  {config.selectedProjectId === p.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-proj">Or create a new project</Label>
            <div className="flex gap-2">
              <Input
                id="new-proj"
                placeholder="Project name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createAndSave()}
              />
              <Button onClick={createAndSave} disabled={!newName.trim() || creating}>
                <Plus className="mr-1.5 h-4 w-4" /> Create
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
