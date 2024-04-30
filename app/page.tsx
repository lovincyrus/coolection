"use client";

import React, { useState } from "react";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Results } from "./components/results";

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <div className="max-w-xl px-4 md:px-0 mx-auto w-full pt-4 text-sm">
        <Header />

        <div className="mt-20">
          {/* <Intro /> */}

          <div className="flex flex-col mt-4">
            <input
              className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
              placeholder="Search for a site..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-8">
              <Results query={query} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
