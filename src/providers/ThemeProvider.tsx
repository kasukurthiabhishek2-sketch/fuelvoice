/**
 * Theme Provider
 *
 * Theme preference is exposed through useSyncExternalStore so SSR hydration
 * starts from a deterministic server snapshot and then reconciles with
 * localStorage/system preference without an effect-driven state race.
 */

'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = 'fuelvoice-theme';
const THEME_EVENT = 'fuelvoice:theme-change';
const SERVER_SNAPSHOT = 'system:dark';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function getSnapshot(): string {
  const theme = readTheme();
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return `${theme}:${system}`;
}

function getServerSnapshot(): string {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => onStoreChange();

  mediaQuery.addEventListener('change', handleChange);
  window.addEventListener('storage', handleChange);
  window.addEventListener(THEME_EVENT, handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
  };
}

function resolveSnapshot(snapshot: string): {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
} {
  const [rawTheme, systemTheme] = snapshot.split(':');
  const theme: Theme = isTheme(rawTheme) ? rawTheme : 'system';
  const resolvedTheme: 'light' | 'dark' =
    theme === 'system'
      ? (systemTheme === 'light' ? 'light' : 'dark')
      : theme;

  return { theme, resolvedTheme };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { theme, resolvedTheme } = resolveSnapshot(snapshot);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // The visual theme can still change when storage is unavailable.
    }

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextDark = newTheme === 'dark' || (newTheme === 'system' && systemDark);
    document.documentElement.classList.toggle('dark', nextDark);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    // Read the currently visible DOM theme so an interaction that happens
    // immediately after hydration can never be overwritten by stale state.
    const currentlyDark = document.documentElement.classList.contains('dark');
    setTheme(currentlyDark ? 'light' : 'dark');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
