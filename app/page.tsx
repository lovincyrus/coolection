"use client";

import React, { useState } from "react";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Results } from "./components/results";

const isValidUrl = (input: string) => {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
};

export default function Home() {
  const [query, setQuery] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior

    if (isValidUrl(query)) {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: query,
        }),
      });

      if (response.ok) {
        console.log("Link added successfully");
        setQuery(""); // Reset the input field after successful addition
      } else {
        console.error("Failed to add the link");
      }
    } else {
      // If the input is not a valid URL, perform a search
      console.log("Performing search for:", query);
      // Implement search functionality here
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <div className="max-w-xl px-4 md:px-0 mx-auto w-full pt-4 text-sm">
        <Header />

        <div className="mt-20">
          {/* <Intro /> */}

          <div className="flex flex-col mt-4">
            <form onSubmit={handleSubmit}>
              <input
                className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
                placeholder="Search for a site..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Submit
              </button>
            </form>
            <div className="my-8">
              <Results query={query} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
