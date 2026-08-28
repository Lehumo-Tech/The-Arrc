"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle button — switches between light and dark mode using next-themes.
 *
 * Uses the liquid-glass-clear surface treatment so it sits elegantly on top of
 * any background (nav bar, hero, etc.). Renders a skeleton placeholder until
 * mounted to avoid hydration mismatch (next-themes reads localStorage client-side).
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Standard next-themes mount guard — avoids hydration mismatch.
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (!mounted) {
    // Placeholder to prevent layout shift + hydration mismatch.
    return (
      <div
        className={`theme-toggle ${className}`}
        aria-hidden="true"
        style={{ width: "2.5rem", height: "2.5rem" }}
      />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-arrc-gold" />
      ) : (
        <Moon className="h-4 w-4 text-arrc-700" />
      )}
    </button>
  );
}
