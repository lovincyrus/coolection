"use server";

import React from "react";

import { GoBackNavigation } from "@/app/components/go-back-navigation";
import { getListById } from "@/lib/get-list-by-id";

import { Footer } from "../../components/footer";
import { ListResults } from "../../components/list-results";

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
        <div className="h-8" />

        <div className="mt-20 flex flex-col">
          <GoBackNavigation listId={params.listId} />
          <ListResults listId={params.listId} />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
