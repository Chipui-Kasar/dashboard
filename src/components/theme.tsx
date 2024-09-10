"use client";

import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Toggle } from "./ui/toggle";

// Check local storage for the saved theme preference directly
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isDarkMode") === "true";
  }
  return false; // Default to light mode if no preference is saved
};

const DarkTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    // Ensure the theme class is set correctly on mount
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("isDarkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  return (
    <div className="fixed right-4">
      <Toggle
        aria-label="Toggle dark mode"
        onClick={() => setIsDarkMode((prevState: boolean) => !prevState)}
      >
        {isDarkMode ? (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Toggle>
    </div>
  );
};

export default DarkTheme;
