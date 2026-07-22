import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PromptWorkspace } from "@/components/prompt-workspace";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Code Generator — CreatorFlow AI" },
      {
        name: "description",
        content:
          "Generate production-ready code in Java, Spring Boot, React, TypeScript, Python, SQL, HTML, CSS, C#, and more.",
      },
      { property: "og:title", content: "Code Generator — CreatorFlow AI" },
      {
        property: "og:description",
        content: "AI-generated code across the modern stack — clean, complete, and ready to ship.",
      },
    ],
  }),
  component: CodePage,
});

const LANGUAGES = [
  "Java",
  "Spring Boot",
  "React",
  "TypeScript",
  "Python",
  "JavaScript",
  "SQL",
  "HTML",
  "CSS",
  "C#",
];

function CodePage() {
  const [language, setLanguage] = useState("TypeScript");
  const [explain, setExplain] = useState(false);

  return (
    <PromptWorkspace
      kind="code"
      title="Code that ships"
      subtitle="Production-quality code across your favorite languages and frameworks. Explanations only when you ask."
      placeholder="Describe the code you want. e.g. 'A Spring Boot controller for creating invoices with validation.'"
      generateLabel="Generate Code"
      toolbar={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
            <Label htmlFor="lang" className="text-xs text-muted-foreground">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="lang" className="h-7 border-0 shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
            <Switch id="explain" checked={explain} onCheckedChange={setExplain} />
            <Label htmlFor="explain" className="text-xs">
              Explain
            </Label>
          </div>
        </div>
      }
      onGenerate={async (prompt) => {
        const res = await fetch("/api/generate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, language, explain }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { text: string };
        return { output: data.text, meta: { language } };
      }}
      renderOutput={(text) => <CodeBlock text={text} />}
    />
  );
}

function CodeBlock({ text }: { text: string }) {
  // Strip surrounding triple-backtick fences if present, preserve if multiple sections.
  return (
    <pre className="max-h-[70vh] overflow-auto rounded-lg border bg-[oklch(0.17_0.02_262)] p-4 text-[13px] leading-6 text-[oklch(0.95_0.02_262)]">
      <code>{text}</code>
    </pre>
  );
}
