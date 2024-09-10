"use client";
import { Dashboard } from "@/components/dashboard";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)] `}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        <Dashboard />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://chipuikasar.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Visit my site
        </a>
      </footer>
    </div>
  );
}
