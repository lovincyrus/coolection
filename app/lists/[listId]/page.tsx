"use server";

import { notFound } from "next/navigation";
import React from "react";

import { Footer } from "@/app/components/footer";
import { GoBackNavigation } from "@/app/components/go-back-navigation";
import { Header } from "@/app/components/header";
import { ListResults } from "@/app/components/list-results";
import { getAllLists } from "@/app/data";
import { getListById } from "@/lib/get-list-by-id";

type Params = {
  params: { listId: string };
};

const listsData = getAllLists();

export async function generateMetadata({ params }: Params) {
  const list = await getListById(params.listId);

  if (!list) return notFound();

  return {
    title: `${list?.name} · Coolection`,
  };
}

export default async function Page({ params }: Params) {
  return (
    <main>
      <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <Header listId={params.listId} listsServerData={listsData} />

        <div className="mt-14 flex flex-col">
          <GoBackNavigation
            listId={params.listId}
            listsServerData={listsData}
          />
          <ListResults listId={params.listId} listsServerData={listsData} />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
