"use server";

import React from "react";

import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { ListNavigationClient } from "../components/list-navigation-client";
import { MainResultsClient } from "../components/main-results-client";
import { SearchBar } from "../components/search-bar";

export async function generateMetadata() {
  return {
    title: "Home · Coolection",
  };
}

export default async function HomePage() {
  return (
    <main>
      <div className="mx-auto min-h-dvh w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <Header heading="Home" />

        <div className="mt-14 flex flex-col">
          <ListNavigationClient />

          <div className="h-4" />

          <SearchBar />

          <div className="h-4" />

          <MainResultsClient />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
