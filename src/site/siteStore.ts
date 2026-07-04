import { create } from "zustand";

type Theme = "light" | "dark";

const THEME_KEY = "site-theme";

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type SiteState = {
  theme: Theme;
  reducedMotion: boolean;
  expandedId: string | null;
  toggleTheme: () => void;
  setReducedMotion: (value: boolean) => void;
  toggleExpanded: (id: string) => void;
};

export const useSiteStore = create<SiteState>((set) => ({
  theme: initialTheme(),
  reducedMotion: false,
  expandedId: null,
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "light" ? "dark" : "light";
      window.localStorage.setItem(THEME_KEY, theme);
      return { theme };
    }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  toggleExpanded: (id) =>
    set((state) => ({ expandedId: state.expandedId === id ? null : id }))
}));
