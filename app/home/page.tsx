"use server";

import React, { Suspense } from "react";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

import { Footer } from "../components/footer";
import { Header } from "../components/header";
import MainResults from "../components/main-results";
import { ResultItemSkeletons } from "../components/result-item-skeletons";
import { SearchBar } from "../components/search-bar";
import { getAllLists, getItems } from "../data";

export async function generateMetadata() {
  return {
    title: "Home · Coolection",
  };
}

const listsServerData = getAllLists();
const itemsServerData = getItems(1, DEFAULT_PAGE_SIZE);

export default async function HomePage() {
  return (
    <main>
      <div className="mx-auto min-h-dvh w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <Header
          heading="Home"
          listsServerData={listsServerData}
          itemsServerData={itemsServerData}
        />

        <div className="mt-14 flex flex-col">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>

          <div className="h-4" />

          <Suspense fallback={<ResultItemSkeletons />}>
            <MainResults
              listsServerData={listsServerData}
              itemsServerData={itemsServerData}
            />
          </Suspense>
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
