import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settings, useStore, history, projects } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CreatorFlow AI" },
      { name: "description", content: "Customize CreatorFlow AI to fit the way you create." },
      { property: "og:title", content: "Settings — CreatorFlow AI" },
      { property: "og:description", content: "Preferences and workspace controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useStore(() => settings.get());

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">
          Settings
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune CreatorFlow AI to match your workflow.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border p-5 shadow-soft">
          <p className="text-base font-semibold">Defaults</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Default voice (Audio)</Label>
              <Select
                value={s.defaultVoice}
                onValueChange={(v) => settings.set({ defaultVoice: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default code language</Label>
              <Select
                value={s.defaultLanguage}
                onValueChange={(v) => settings.set({ defaultLanguage: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Java", "Spring Boot", "React", "TypeScript", "Python", "JavaScript", "SQL", "HTML", "CSS", "C#"].map(
                    (v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="border p-5 shadow-soft">
          <p className="text-base font-semibold">Local data</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All history and projects are stored in your browser. Clear at any time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Clear all history?")) {
                  history.clear();
                  toast.success("History cleared");
                }
              }}
            >
              Clear history
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Delete all projects? This cannot be undone.")) {
                  projects.list().forEach((p) => projects.remove(p.id));
                  toast.success("Projects deleted");
                }
              }}
            >
              Delete all projects
            </Button>
          </div>
        </Card>

        <Card className="border p-5 shadow-soft">
          <p className="text-base font-semibold">About CreatorFlow AI</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Version 1.0. Built for creators who value speed, quality, and calm.
          </p>
        </Card>
      </div>
    </div>
  );
}
