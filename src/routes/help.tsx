import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — CreatorFlow AI" },
      { name: "description", content: "Answers to common questions about CreatorFlow AI." },
      { property: "og:title", content: "Help — CreatorFlow AI" },
      { property: "og:description", content: "Get the most out of your creator studio." },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. CreatorFlow AI is open-workspace — arrive at the dashboard and start creating immediately.",
  },
  {
    q: "Where is my data stored?",
    a: "Projects and history are stored locally in your browser. Clearing site data will remove them.",
  },
  {
    q: "What does Improve Prompt do?",
    a: "It rewrites a short prompt into a richer, more specific version tailored to the current generator.",
  },
  {
    q: "Can I refresh the prompt suggestions?",
    a: "Yes. Every generator has a Refresh button that fetches a new set of prompt ideas for that generator only.",
  },
  {
    q: "Which languages does the Code Generator support?",
    a: "Java, Spring Boot, React, TypeScript, Python, JavaScript, SQL, HTML, CSS, and C#. More can be added on request.",
  },
  {
    q: "Can I download what I create?",
    a: "Yes — every output can be downloaded. Images export as PNG, audio as MP3, and text/code as files.",
  },
];

function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-12">
      <Badge variant="secondary" className="mb-2">Help</Badge>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Frequently asked</h1>
      <p className="mt-2 text-muted-foreground">Quick answers to help you get moving.</p>
      <Card className="mt-8 border p-2 shadow-soft">
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="px-3">
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
