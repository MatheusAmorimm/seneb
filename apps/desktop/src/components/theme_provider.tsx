"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isHome: boolean;
  setIsHome: (isHome: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isHome, setIsHome] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initStore = async () => {
      try {
        const store = await load("settings.json", { autoSave: true });
        
        const savedTheme = await store.get<Theme>("theme");

        if (savedTheme) setThemeState(savedTheme);
      } catch (e) {
        console.error("Failed to load store", e);
        // Fallback to localStorage if Tauri Store fails (e.g. in web browser)
        const localTheme = localStorage.getItem("theme") as Theme;
        if (localTheme) setThemeState(localTheme);
      } finally {
        setIsLoaded(true);
      }
    };
    initStore();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      const store = await load("settings.json", { autoSave: true });
      await store.set("theme", newTheme);
    } catch (e) {
      localStorage.setItem("theme", newTheme);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // No light mode, usamos o gradiente padrão. No dark mode, cor sólida.
    if (theme === "dark") {
      root.style.setProperty("--body-bg", "#011c29"); // Cor do dark mode
    } else {
      root.style.setProperty("--body-bg", "linear-gradient(to bottom right, #FEF5C8, #e8f0ef)");
    }
  }, [theme, isLoaded]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isHome, setIsHome }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
