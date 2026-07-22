// Local persistence for projects, history, and settings.
// Client-side only. Guard against SSR by checking window.

export type GeneratorKind = "text" | "code" | "image" | "audio";

export interface HistoryEntry {
  id: string;
  kind: GeneratorKind;
  prompt: string;
  output: string; // text/code = raw, image = data URL, audio = data URL
  meta?: Record<string, string>;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  items: HistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  theme: "light" | "dark";
  defaultVoice: string;
  defaultLanguage: string;
}

const K_HISTORY = "cf.history.v1";
const K_PROJECTS = "cf.projects.v1";
const K_SETTINGS = "cf.settings.v1";

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("cf-store", { detail: { key } }));
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const history = {
  list(): HistoryEntry[] {
    return read<HistoryEntry[]>(K_HISTORY, []);
  },
  add(entry: Omit<HistoryEntry, "id" | "createdAt">) {
    const next: HistoryEntry = { ...entry, id: uid(), createdAt: Date.now() };
    const list = [next, ...history.list()].slice(0, 200);
    write(K_HISTORY, list);
    return next;
  },
  remove(id: string) {
    write(K_HISTORY, history.list().filter((h) => h.id !== id));
  },
  clear() {
    write(K_HISTORY, []);
  },
};

export const projects = {
  list(): Project[] {
    return read<Project[]>(K_PROJECTS, []);
  },
  get(id: string) {
    return projects.list().find((p) => p.id === id);
  },
  create(name: string, description?: string) {
    const p: Project = {
      id: uid(),
      name,
      description,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    write(K_PROJECTS, [p, ...projects.list()]);
    return p;
  },
  update(id: string, patch: Partial<Project>) {
    const list = projects.list().map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
    );
    write(K_PROJECTS, list);
  },
  remove(id: string) {
    write(K_PROJECTS, projects.list().filter((p) => p.id !== id));
  },
  addItem(id: string, item: HistoryEntry) {
    const list = projects.list().map((p) =>
      p.id === id ? { ...p, items: [item, ...p.items], updatedAt: Date.now() } : p,
    );
    write(K_PROJECTS, list);
  },
  removeItem(projectId: string, itemId: string) {
    const list = projects.list().map((p) =>
      p.id === projectId
        ? { ...p, items: p.items.filter((i) => i.id !== itemId), updatedAt: Date.now() }
        : p,
    );
    write(K_PROJECTS, list);
  },
};

export const settings = {
  get(): Settings {
    return read<Settings>(K_SETTINGS, {
      theme: "light",
      defaultVoice: "alloy",
      defaultLanguage: "TypeScript",
    });
  },
  set(patch: Partial<Settings>) {
    write(K_SETTINGS, { ...settings.get(), ...patch });
  },
};

import { useEffect, useState } from "react";

export function useStore<T>(read: () => T): T {
  const [value, setValue] = useState<T>(() => read());
  useEffect(() => {
    const update = () => setValue(read());
    update();
    window.addEventListener("cf-store", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cf-store", update);
      window.removeEventListener("storage", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
