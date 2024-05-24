"use server";

import React from "react";

import { Footer } from "../../components/footer";
// import { Header } from "../../components/header";
import { Search } from "../../components/search";

type Params = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Params) {
  return {
    // TODO: use name instead of slug
    title: `${params.slug} · Coolection`,
  };
}

export default async function Page({ params }: Params) {
  return (
    <main className="grid min-h-dvh w-full grid-rows-[1fr,49px] content-center">
      <div className="mx-auto h-full w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        {/* <Header /> */}

        <div>{params.slug}</div>

        <div className="mt-20 flex flex-col">
          <Search />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
