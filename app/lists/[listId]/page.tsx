"use server";

import React from "react";

import { Footer } from "@/app/components/footer";
import { GoBackNavigation } from "@/app/components/go-back-navigation";
import { Header } from "@/app/components/header";
import { ListResults } from "@/app/components/list-results";
import { getListById } from "@/lib/get-list-by-id";

type Params = {
  params: { listId: string };
};

export async function generateMetadata({ params }: Params) {
  const list = await getListById(params.listId);
  return {
    title: `${list?.name} · Coolection`,
  };
}

export default async function Page({ params }: Params) {
  return (
    <main className="grid min-h-dvh w-full grid-rows-[1fr,49px] content-center">
      <div className="mx-auto h-full w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <Header listId={params.listId} />

        <div className="mt-14 flex flex-col">
          <GoBackNavigation listId={params.listId} />
          <ListResults listId={params.listId} />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
