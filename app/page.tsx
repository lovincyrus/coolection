"use client";

import React, { useState } from "react";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Results } from "./components/results";

function isValidUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

function isTwitterUrl(input: string) {
  try {
    const url = new URL(input);
    return url.hostname === "twitter.com";
  } catch {
    return false;
  }
}

export default function Home() {
  const [query, setQuery] = useState("");

  async function handleKeyPress() {
    if (isTwitterUrl(query)) {
      const response = await fetch("/api/add-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterUrl: query,
        }),
      });

      if (response.ok) {
        console.log("Twitter link added successfully");
        setQuery("");
      } else {
        console.error("Failed to add the Twitter link");
      }
    } else if (isValidUrl(query)) {
      const response = await fetch("/api/add-website", {
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
      // TODO:
      console.log("Performing search for:", query);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <div className="max-w-xl px-4 md:px-0 mx-auto w-full pt-4 text-sm">
        <Header />

        <div className="mt-20">
          {/* <Intro /> */}

          <div className="flex flex-col mt-4">
            <input
              className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
              placeholder="Insert a link, a tweet or search..."
              value={query}
              onChange={handleChange}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  handleKeyPress();
                }
              }}
            />

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
