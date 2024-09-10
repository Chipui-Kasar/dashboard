"use client";

import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Toggle } from "./ui/toggle";

const DarkTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("isDarkMode") === "true";
      setIsDarkMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode !== null) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("isDarkMode", isDarkMode ? "true" : "false");
    }
  }, [isDarkMode]);
  if (isDarkMode === null) {
    return null; // Or return a loader if you have one
  }
  return (
    <div className="fixed right-4">
      <Toggle
        aria-label="Toggle dark mode"
        onClick={() => setIsDarkMode((prevState: boolean) => !prevState)}
      >
        {isDarkMode ? (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        ) : (
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all" />
        )}
      </Toggle>
    </div>
  );
};

export default DarkTheme;
