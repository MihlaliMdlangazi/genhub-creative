import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Shield, Wand2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CreatorFlow AI" },
      {
        name: "description",
        content: "CreatorFlow AI is a professional AI content studio for writers, developers, designers, and creators.",
      },
      { property: "og:title", content: "About — CreatorFlow AI" },
      { property: "og:description", content: "Why CreatorFlow AI exists." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-12">
      <Badge variant="secondary" className="mb-2">About</Badge>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
        Built for people who <span className="text-gradient-brand">actually ship</span>.
      </h1>
      <p className="mt-3 text-muted-foreground">
        CreatorFlow AI is a premium content studio that unifies AI generators for text, code, images,
        and audio in one calm workspace. No accounts, no clutter, no chat bubbles — just a professional
        environment designed to help you produce your best work.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { Icon: Wand2, title: "Focused studios", body: "Each generator is a dedicated environment tuned to a single medium." },
          { Icon: Zap, title: "Ready in seconds", body: "Open the app and start creating. No signup, no onboarding tax." },
          { Icon: Sparkles, title: "Prompt tooling", body: "Refreshable libraries and one-click prompt improvement built in." },
          { Icon: Shield, title: "Your data, your machine", body: "Projects and history live in your browser, not in a database." },
        ].map((f) => (
          <Card key={f.title} className="border p-5 shadow-soft">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-lift">
              <f.Icon className="h-4 w-4 text-white" />
            </span>
            <p className="mt-3 font-semibold">{f.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
