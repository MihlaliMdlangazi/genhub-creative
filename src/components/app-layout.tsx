import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Type,
  Code2,
  ImageIcon,
  AudioLines,
  FolderKanban,
  BookMarked,
  History,
  Settings as SettingsIcon,
  Search,
  Info,
  HelpCircle,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/text", label: "Text Generator", icon: Type },
  { to: "/code", label: "Code Generator", icon: Code2 },
  { to: "/image", label: "Image Generator", icon: ImageIcon },
  { to: "/audio", label: "Audio Generator", icon: AudioLines },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/library", label: "Prompt Library", icon: BookMarked },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = (localStorage.getItem("cf.theme") as "light" | "dark") ?? "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("cf.theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  return { theme, toggle };
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar md:text-sidebar-foreground">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground shadow-lift">
            <SidebarInner pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
          <button
            className="rounded-md p-2 hover:bg-accent md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search projects, prompts, history…"
              className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/about"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              <Info className="mr-1.5 h-4 w-4" /> About
            </Link>
            <Link
              to="/help"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              <HelpCircle className="mr-1.5 h-4 w-4" /> Help
            </Link>
            <button
              onClick={toggle}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-lift">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            CreatorFlow<span className="text-primary"> AI</span>
          </span>
        </Link>
        {onClose && (
          <button
            className="rounded-md p-2 hover:bg-sidebar-accent"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((n) => {
          const active = pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="rounded-xl border bg-card p-3 shadow-soft">
          <p className="text-xs font-medium">Pro tip</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use "Improve Prompt" to get sharper, more specific results.
          </p>
        </div>
      </div>
    </>
  );
}
