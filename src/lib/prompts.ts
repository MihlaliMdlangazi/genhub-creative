import type { GeneratorKind } from "./store";

export interface PromptTemplate {
  title: string;
  body: string;
}

export const seedPrompts: Record<GeneratorKind, PromptTemplate[]> = {
  text: [
    {
      title: "Professional Email",
      body: "Write a concise, professional email to a client updating them on the current status of their project. Include a friendly greeting, three specific milestones we have completed, one blocker with a proposed solution, and a clear next step with a date. Keep the tone confident and warm, avoid jargon, and end with a polite sign-off.",
    },
    {
      title: "LinkedIn Post",
      body: "Write a compelling LinkedIn post (about 180 words) sharing a lesson I learned while shipping a product feature under tight deadlines. Open with a strong hook, use short punchy paragraphs, weave in a concrete story, and close with a question that invites discussion. Do not use hashtags in the body; suggest 4 relevant hashtags at the end.",
    },
    {
      title: "Business Proposal",
      body: "Draft a one-page business proposal for offering AI-powered content workflows to a mid-market marketing team. Include: executive summary, problem statement, proposed solution, deliverables, timeline (6 weeks), pricing tiers, and a clear call to action. Keep language executive-friendly and outcome-driven.",
    },
    {
      title: "Technical Documentation",
      body: "Produce clear, structured technical documentation for a REST API endpoint that creates a user. Cover: purpose, HTTP method and path, authentication, request headers, request body schema with field types and constraints, example request, example success response, error responses with codes, and rate limits. Use Markdown with tables and code blocks.",
    },
    {
      title: "Blog Article",
      body: "Write a 900-word blog article titled 'The Quiet Skills That Separate Senior Engineers'. Use an engaging intro, five subheaded sections with real examples, and a conclusion that invites reflection. Keep the tone thoughtful, avoid clichés, and target engineers with 3–7 years of experience.",
    },
    {
      title: "Marketing Landing Copy",
      body: "Write high-converting landing page copy for a SaaS tool that helps solo founders schedule and repurpose long-form content. Include a hero headline, sub-headline, three feature blocks with icons described in brackets, a customer-quote placeholder, and a strong final CTA. Match a confident, modern voice.",
    },
    {
      title: "Executive Summary",
      body: "Summarize a 30-page product strategy document into a one-page executive summary. Include the strategic goal, market context, top three initiatives with success metrics, resource requirements, and risks with mitigations. Use bullet points where useful and keep sentences tight.",
    },
    {
      title: "Essay",
      body: "Write a thoughtful 700-word essay exploring how attention became the scarce resource of the internet economy. Argue a clear thesis, support it with two historical examples and one contemporary case study, address a counter-argument, and close with a forward-looking prediction.",
    },
  ],
  code: [
    {
      title: "Spring Boot REST API",
      body: "Generate a production-ready Spring Boot 3 REST controller and service for managing 'Invoice' resources. Include: JPA entity with proper columns and constraints, repository interface, service layer with business logic, DTOs for request and response, controller with GET (list + by id), POST, PUT, DELETE endpoints, validation annotations, exception handling with @ControllerAdvice, and OpenAPI annotations. Use Java 21 syntax and follow clean layering.",
    },
    {
      title: "React Component",
      body: "Create a reusable React + TypeScript component named 'DataTable' with generics, sortable columns, search input, pagination, empty state, and loading skeleton. Style with Tailwind CSS, expose typed props, memoize expensive computations, and export both the component and its Column type. Do not include commentary — return production-ready code only.",
    },
    {
      title: "Authentication System",
      body: "Implement a JWT authentication flow in Node.js with Express and TypeScript. Provide: /register and /login routes with input validation, password hashing with bcrypt, access and refresh token generation, middleware to protect routes, refresh endpoint with rotation, and typed request handlers. Include a users repository interface but leave storage swappable.",
    },
    {
      title: "SQL Database Schema",
      body: "Design a normalized PostgreSQL schema for a multi-tenant project management app. Include tables for organizations, users, memberships (with role enum), projects, tasks (with status and priority enums), comments, and audit_log. Add primary keys, foreign keys with ON DELETE rules, indexes for common queries, and helpful CHECK constraints. Return the CREATE TABLE statements only.",
    },
    {
      title: "Unit Tests",
      body: "Write thorough unit tests using Vitest and @testing-library/react for a 'useDebouncedValue' hook. Cover: initial value, updates within delay, updates across delay boundaries, cleanup on unmount, and dynamic delay changes. Use fake timers where appropriate. Return only the test file.",
    },
    {
      title: "Python Data Pipeline",
      body: "Write a Python 3.11 script that ingests a CSV of transactions, deduplicates by transaction_id, normalizes currency to USD via a rates dict, aggregates daily totals per merchant, and writes the result to Parquet. Use pandas, type hints, argparse for CLI flags, and a main() function guarded by __name__.",
    },
    {
      title: "HTML + CSS Layout",
      body: "Produce a single self-contained HTML file for a modern pricing page with three tiers, using semantic HTML5 and modern CSS (custom properties, grid, and clamp for fluid type). Include a subtle gradient hero, feature list per tier, a highlighted 'popular' plan, and a responsive layout that stacks below 768px.",
    },
    {
      title: "C# Web API",
      body: "Generate an ASP.NET Core 8 minimal API for a 'Task' resource. Include: record for the entity, in-memory repository interface + implementation, endpoint definitions for CRUD, request/response DTOs, model validation with data annotations, and Swagger setup in Program.cs. Return C# code only.",
    },
  ],
  image: [
    {
      title: "Logo Design",
      body: "Design a minimalist geometric logo for a fintech startup called 'Arcline'. Use a monogram based on an interlocking 'A' shape, single-color mark on a light neutral background, confident negative space, subtle depth via one soft shadow. Modern, timeless, suitable for both dark and light backgrounds.",
    },
    {
      title: "Mobile App UI",
      body: "Photorealistic 3D render of a modern mobile banking app UI shown on a floating iPhone-style device against a soft gradient background. Card-based layout with balance, spending chart, and quick actions. Slate and indigo palette, soft shadows, glassmorphic accents, high detail.",
    },
    {
      title: "Website Hero Section",
      body: "Editorial illustration for a SaaS landing page hero: an abstract composition of layered translucent panels, floating data cards, and a soft light gradient. Muted indigo, sky blue, and off-white palette. Clean, aspirational, professional, wide 16:9 composition with space on the left for a headline.",
    },
    {
      title: "Product Advertisement",
      body: "High-end commercial photograph of a luxury silver perfume bottle on a matte marble surface. Studio lighting from the upper left, subtle reflections, faint mist in the air, deep shadow gradient background. Sharp focus on the bottle, shallow depth of field, magazine-cover quality.",
    },
    {
      title: "Character Design",
      body: "Concept art of a friendly astronaut robot exploring an alien botanical garden. Rounded matte-white armor, soft cyan glow at the joints, expressive optical sensor, gentle posture. Painterly lighting, dusk atmosphere, lush bioluminescent plants, cinematic composition.",
    },
    {
      title: "Futuristic Office",
      body: "Wide interior photograph of a futuristic AI research office at golden hour. Floor-to-ceiling windows overlooking a city skyline, translucent holographic monitors, minimalist walnut and matte white furniture, warm ambient lighting, engineers collaborating around a glass table. Photorealistic, architectural digest quality.",
    },
    {
      title: "Book Cover",
      body: "Design a book cover for a literary novel titled 'The Cartographers of Silence'. A lone figure walking through a fog-covered valley toward a distant lighthouse, muted teal and warm ochre palette, hand-drawn typography for the title, elegant serif for the author name, textured paper feel.",
    },
    {
      title: "Isometric Illustration",
      body: "Clean isometric illustration of a small modern workspace: standing desk with a laptop, floating charts, a warm lamp, a plant, and a coffee cup. Flat colors with soft shading, indigo and cream palette, subtle drop shadows, crisp vector-style linework.",
    },
  ],
  audio: [
    {
      title: "Podcast Introduction",
      body: "Welcome to Signal & Noise — the podcast where builders, designers, and founders share the real stories behind their craft. I'm your host, and today we're exploring how the tools we use shape the way we think. Stay with us.",
    },
    {
      title: "Product Voice-over",
      body: "Meet CreatorFlow — one calm workspace for every kind of content you create. Write, code, design, and narrate side by side. No tabs, no chaos. Just your ideas, moving forward.",
    },
    {
      title: "Story Narration",
      body: "It was the summer the maps stopped working. Streets folded back on themselves, rivers changed their minds, and every compass in town pointed toward the same old lighthouse at the edge of the harbor. Nora packed a lantern, tightened her boots, and stepped outside.",
    },
    {
      title: "Educational Lesson",
      body: "In this short lesson, we will look at how neural networks learn from examples. Imagine a child sorting shapes into boxes. Each time they get one right, they feel more confident. Each time they get one wrong, they adjust. A neural network does the same, only with numbers instead of shapes.",
    },
    {
      title: "Advertisement",
      body: "Tired of switching between five different apps to finish one idea? CreatorFlow brings text, code, images, and voice into a single studio designed for creators who ship. Try it free today, and see how much lighter your workflow can feel.",
    },
    {
      title: "Meditation Intro",
      body: "Find a quiet place to sit. Let your shoulders soften. Feel the weight of your hands resting in your lap. Take a slow breath in through the nose, and a longer breath out. There is nothing to fix in this moment. You are exactly where you need to be.",
    },
    {
      title: "News Read",
      body: "Good evening. Tonight on the briefing: markets closed higher after a stronger-than-expected earnings season, three new artificial intelligence regulations take effect at midnight, and a small town in the north celebrates the return of its century-old bell. Here are the details.",
    },
    {
      title: "Explainer",
      body: "Ever wondered why your coffee cools faster on a cold day, but your soup stays warm? It comes down to a simple idea called convection. In the next sixty seconds, we'll break it down using nothing but a mug, a spoon, and a little bit of physics.",
    },
  ],
};

// Pick N distinct random items from a list.
export function sample<T>(items: T[], n: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length));
}
