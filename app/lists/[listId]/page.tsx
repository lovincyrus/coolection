"use server";

import React from "react";

import { Navigation } from "@/app/components/navigation";

import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { Results } from "../../components/results";

type Params = {
  params: { listId: string };
};

export async function generateMetadata({ params }: Params) {
  // TODO: write getListNameById
  return {
    // TODO: use name instead of slug
    title: `${params.listId} · Coolection`,
  };
}

export default async function Page({ params }: Params) {
  return (
    <main className="grid min-h-dvh w-full grid-rows-[1fr,49px] content-center">
      <div className="mx-auto h-full w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <Header heading={params.listId} />

        <div className="mt-20 flex flex-col">
          <Navigation />
          <Results listId={params.listId} />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
