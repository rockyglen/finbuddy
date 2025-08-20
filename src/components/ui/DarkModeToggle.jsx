"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false); // prevents hydration mismatch

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDark(true);
    } else {
      setDark(false);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = !dark;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setDark(isDark);
  };

  if (!mounted) return null; // avoid icon flicker during hydration

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      className="p-2 rounded transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {dark ? (
        <Sun className="w-5 h-5 text-yellow-500 transition-transform duration-300 transform rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200 transition-transform duration-300 transform rotate-0 hover:-rotate-90" />
      )}
    </button>
  );
}
