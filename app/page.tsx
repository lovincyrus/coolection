"use client";

import React, { useState } from "react";
import { uuid } from "uuidv4";

import { Footer } from "./components/footer";
import { Header } from "./components/header";

interface Site {
  id: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

const data: Site[] = [
  {
    id: uuid(),
    url: "https://cooking.nytimes.com/recipes/1018684-classic-tiramisu",
    title: "Classic Tiramisù Recipe (with Video) - NYT Cooking",
    description:
      "Done correctly, a classic tiramisù can be transcendent A creamy dessert of espresso-soaked ladyfingers surrounded by lightly sweetened whipped cream and a rich mascarpone, tiramisù relies heavily on the quality of its ingredients If you don’t have a barista setup at home, pick up the espresso at a local coffee shop, or use strongly brewed coffee",
  },
  {
    id: uuid(),
    url: "https://sfcompute.com",
    title: "The San Francisco Compute Company",
    description: "A large, low-cost H100 cluster you can rent by the hour",
  },
  {
    id: uuid(),
    url: "https://latecheckout.studio",
    title: "Late Checkout",
    description:
      "Late Checkout is a community + product design firm. We are an agency, studio and fund building community-based businesses.",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");

  // TODO: fuzzy
  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <div className="max-w-xl px-4 md:px-0 mx-auto w-full pt-4 text-sm">
        <Header />

        <div className="mt-20">
          {/* <Intro /> */}

          <div className="flex flex-col mt-4">
            <input
              className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded appearance-none focus:outline-none focus:shadow-outline"
              placeholder="Search for a site"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-8">
              <h2 className="font-serif text-lg flex justify-between pb-2 gap-1">
                Results
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredData.map((item) => (
                  <a href={item.url} target="_blank" key={item.id}>
                    <div className="flex flex-col p-4 bg-white rounded-lg shadow">
                      <h3 className="text-lg font-serif">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-700">
                        {item.description.length > 120
                          ? item.description.slice(0, 120) + "..."
                          : item.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
